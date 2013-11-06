/* ========================================================================
 * CQ5 Xml Tool: controller.js v1.0.0
 * By Nathan
 * iNotes & Sametime: xuhangdl@cn.ibm.com
 * ======================================================================== */

CQ5.FilesIndexController = Ember.ArrayController.extend({
  hasFile: function() {
    return this.get("model").get("length") > 0;
  }.property("model.@each"),
  createNodeRecordsFromTemplate: function(fileRecord, XmlTemplateDocument) {
    var nodeCount = 0;
    var store = this.get("store");

    var createNodeRecord = function(element) {
      var nodeRecord = store.createRecord('node', {
        id: uuid.v4(),
        index: nodeCount++,
        nodeType: element[0].nodeName,
        isData: element[0].nodeName == "data",
        nodeName: element.attr("nodeName"),
        attributeName: element.attr("attributeName"),
        transAttributeName: element.attr("transAttributeName"),
        dataType: element.attr("dataType"),
        isAllowBlank: true,
        isAlertBlank: false,
        nodeContent: element[0].nodeName == "data" ? element.text().replace(/^\s+|\s+$/g,"") : null
      });

      if (
          element.attr("attributeName") == "Short Model Number" ||
          element.attr("attributeName") == "Unified Model Number" ||
          element.attr("attributeName") == "Model Name" ||
          element.attr("attributeName") == "Model Number" ||
          element.attr("attributeName") == "locale"
        ) {
        nodeRecord.set("isAllowBlank", false);
      }

      if (
          element.attr("attributeName") == "Description For See All" ||
          element.attr("attributeName") == "Product Image" ||
          element.attr("attributeName") == "Variation Image for See All 1"
        ) {
        nodeRecord.set("isAlertBlank", true);
      }
      
      element.children().each(function() {
        nodeRecord.get("childrenNode").addRecord(createNodeRecord($(this)));
      });

      fileRecord.get("nodes").addRecord(nodeRecord);
      return nodeRecord;
    };

    return createNodeRecord(XmlTemplateDocument.children());
  },

  createFileRecord: function(xmlString) {
    return  this.get("store").createRecord('file', {
      xmlString: xmlString,
      technicalFeatureMaxIndex: 0
    });
  },

  convert: function(fileRecord, xmlDocument, convertList) {
    // Start to convert xml file
    var store = this.get("store");
    fileRecord.get('nodes').forEach(function(nodeRecord) {      
      if (!nodeRecord.get("attributeName")) {
        return;
      }
      
      var convertNode = _.findWhere(convertList, {attributeName: nodeRecord.get("attributeName")});
      if (convertNode) {
        nodeRecord.set("nodeContent", convertNode.modifiedContent(store, nodeRecord, xmlDocument));
      }
    }); 
  },

  recognizeCQ5Xml: function(xmlDocument) {
    if (xmlDocument.find("ItemContents > ItemContent").length > 0) {
      return true;
    }
  },

  createFile: function(file, xmlString) {
    var parser = new DOMParser();
    var xmlDocument = $(parser.parseFromString(xmlString, "text/xml"));
    var store = this.get("store");
    var convertList = CQ5.localeManager.recognize(xmlDocument);
    
    if (this.recognizeCQ5Xml(xmlDocument)) {
      var fileRecord = this.createFileRecord(xmlString);
      this.createNodeRecordsFromTemplate(fileRecord, xmlDocument);
      return;
    }

    if (!convertList) {
      alert("Not supported locale.");
      return;
    }
    
    var fileRecord = this.createFileRecord(xmlString);
    this.createNodeRecordsFromTemplate(fileRecord, CQ5.xmlTemplateDocument);
    this.convert(fileRecord, xmlDocument, convertList);       
  },

  actions: {
    newFile: function() {
      var fileRecord = this.createFileRecord("");
      this.createNodeRecordsFromTemplate(fileRecord, CQ5.xmlTemplateDocument);
    },
    delFile: function(file) {
      if(confirm("Do you really want to delete this file?")) {
        file.get("nodes").forEach(function(node) {
          node.deleteRecord();
        });
        file.deleteRecord();
      }
    },
    fileSelected: function(files) {
      var store = this.get("store");
      var controller = this;      
      _.each(files, function(file) {        
        var fileReader = new FileReader();
        fileReader.onload = function(event) { 
          var xmlString = event.target.result;          
          controller.createFile(file, xmlString);
        };
        fileReader.readAsText(file);
      });      
    },
    fileDownload: function() {
      // Zip file generation
      var hasError = false;
      this.get("store").find("file").then(function(files) {
        var zip = new JSZip();

        $("#messages").empty();

        files.forEach(function(file){
          file.get("nodes").forEach(function(node) {
            if (node.get("isError")) {
              $("#messages").prepend('<div class="alert alert-warning">File <strong>' + file.get("name") + "</strong> attribute <strong>" + node.get("attributeName") + '</strong> is <strong>Not Allowed</strong> to keep blank! Pls fix it.</div>');
              hasError = true;
            } else if (node.get("isAlert")) {
              $("#messages").prepend('<div class="alert alert-info">File <strong>' + file.get("name") + "</strong> attribute <strong>" + node.get("attributeName") + '</strong> is blank, maybe you should recheck it.</div>');
            }
          });
        });

        if (hasError) {
          $("#messages").prepend('<div class="alert alert-danger"><strong>There\'s some error occured, pls recheck and fix it!</strong></div>');
          return;
        }

        files.forEach(function(file){
          zip.file(file.get("name"), vkbeautify.xmlmin(file.get("convertedXmlString"), true));
        });        

        if (files.get("length") > 0) {
          var content = zip.generate();
          location.href="data:application/zip;base64," + content;
          $("#messages").prepend('<div class="alert alert-success"><strong>Zip file has generated!</strong></div>');
        }        
      });
    }
  }
});

CQ5.FileXmlController = Ember.ObjectController.extend({
  rootNodeRecord: function() {
    return this.get("model").get("nodes").findProperty("nodeType", "ItemContents");
  }.property("model")
});

CQ5.FileEditController = Ember.ObjectController.extend({
  basicInfomation: function() {
    return this.get("model").get("nodes").filter(function(node) {
      return _.contains([
        "Short Model Number",
        "Unified Model Number",
        "catalogName",
        "Category",
        "Overview"
      ], node.get("attributeName"));
    });
  }.property("model"),

  features: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "Features").get("childrenNode");
  }.property("model"),

  generalData: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "GeneralData").get("childrenNode");
  }.property("model"),

  marketingDescription: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "MarketingDescription").get("childrenNode");
  }.property("model"),

  digitalAssets: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "DigitalAssets").get("childrenNode");
  }.property("model"),

  getInspired: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "GetInspired").get("childrenNode");
  }.property("model"),

  accessory: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "Accessory").get("childrenNode");
  }.property("model"),

  keyTechnicalFeature: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "KeyTechnicalFeature").get("childrenNode");
  }.property("model"),

  faceted: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "Faceted").get("childrenNode");
  }.property("model"),

  variation: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "Variation").get("childrenNode");
  }.property("model"),

  techRecords: function() {
    return this.get("model").get("nodes").findProperty("attributeName", "TechnicalFeature").get("childrenNode");
  }.property("model")
});

CQ5.FileIndexController = Ember.ObjectController.extend({
  basicInfomation: function() {
    var data = this.get("model").get("nodes").filter(function(node) {
      return _.contains([
        "locale",
        "Display Model Number",
        "Full Product Name",
        "Short Model Number",
        "Key Copy",
        "Sub Copy",
        "Description For See All",
        "catalogName",
        "Product Main Picture",
        "Sub Brand Logo Image"
      ], node.get("attributeName"));
    });

    var isShow = false;

    data.forEach(function(record) {
      if (!record.get("isNull")) {
        isShow = true;
      }
    });

    return {
      isShow: isShow,
      data: data
    }
  }.property("model.nodes.@each.nodeContent"),
  
  features: function() {
    var features = [];
    this.get("model").get("nodes").findProperty("attributeName", "Features").get("childrenNode").forEach(function(record, index) {
      if (record.get("attributeName") != "Number Of Features") {
        var sectorName = record.get("childrenNode").get("firstObject").get("nodeContent");
        var factors = [];
        var factor = {};
        
        record.get("childrenNode").forEach(function(record, index) {
          if (index === 0) {
            return;
          }
          
          if (index % 2 === 1) {
            factor = {};
            factor.factorName = record.get("nodeContent");
          } else {
            factor.factorID = record.get("nodeContent");
            if (factor.factorName === "" && factor.factorID === "") {
              return;
            }

            if (factor.factorName === "") {
              factor.factorName = "###NO FACTOR NAME###";
            }

            if (factor.factorID === "") {
              factor.factorID = "###NO FACTOR ID###";
            }

            factors.push(factor);
          }
        });

        if (sectorName === "") {
          sectorName = "###NO SECTOR NAME###";
        }

        if (factors.length > 0) {
          features.push({
            id: record.get("id"),
            sectorName: sectorName,
            factors: factors,
            href: "#" + record.get("id"),
            isActive: index === 1
          });
        }        
      }
    });
    return {
      isShow: features.length > 0,
      data: features
    };
  }.property(
    "model.nodes.@each.nodeContent"
  ),
  
  specifications: function() {
    var data = this.get("model").get("nodes").filter(function(node) {
      return _.contains([
        "Product Image",
        "Variation Image for See All 1"
      ], node.get("attributeName"));
    });

    var isShow = false;

    data.forEach(function(record) {
      if (!record.get("isNull")) {
        isShow = true;
      }
    });

    return {
      isShow: isShow,
      data: data
    }
  }.property("model.nodes.@each.nodeContent"),
  
  getInspired: function() {
    var data = this.get("model").get("nodes").findProperty("attributeName", "GetInspired").get("childrenNode");
    var isShow = false;

    data.forEach(function(record) {
      if (!record.get("isNull")) {
        isShow = true;
      }
    });
    
    return {
      isShow: isShow,
      data: data
    }
  }.property("model.nodes.@each.nodeContent"),
  
  accessoryItems: function() {
    var accessories = [];
    var accessory = {};

    this.get("model").get("nodes").findProperty("attributeName", "AccessoryItems").get("childrenNode").forEach(function(record, index) {
      if (index % 3 === 0) {
        accessory = {};
        accessory.accessoryModelNumber = record.get("nodeContent");        
      } else if (index % 3 === 1) {
        accessory.accessoryImage = record.get("nodeContent");  
      } else {
        accessory.accessoryText = record.get("nodeContent");
        if (accessory.accessoryModelNumber !== "") {
          accessories.push(accessory);
        }        
      }
    });
    
    return {
      isShow: accessories.length > 0,
      data: accessories
    }
  }.property(
    "model.nodes.@each.nodeContent"
  ),

  accessoryCategories: function() {
    var accessoryCategories = [];
    var accessoryCategory = {};

    this.get("model").get("nodes").findProperty("attributeName", "AccessoryCategory").get("childrenNode").forEach(function(record, index) {
      if (index == 0) {
        return;
      }

      if (index % 2 === 1) {
        accessoryCategory = {};
        accessoryCategory.accessoryCategoryTitle = record.get("nodeContent");
        
      } else {
        accessoryCategory.accessoryCategoryID = record.get("nodeContent");
        if (accessoryCategory.accessoryCategoryTitle !== "") {
          accessoryCategories.push(accessoryCategory);
        }
      }
    });
    
    return {
      isShow: accessoryCategories.length > 0,
      data: accessoryCategories
    }
  }.property(
    "model.nodes.@each.nodeContent"
  ),
  
  category: function() {
    var data = this.get("model").get("nodes").findProperty("attributeName", "Category").get("childrenNode");
    var isShow = false;

    data.forEach(function(record) {
      if (!record.get("isNull")) {
        isShow = true;
      }
    });
    
    return {
      isShow: isShow,
      data: data
    }
  }.property(
    "model.nodes.@each.nodeContent"
  ),

  path: function() {
    var smn = this.get("model").get("nodes").findProperty("attributeName", "Short Model Number").get("nodeContent");
    var locale = this.get("model").get("nodes").findProperty("attributeName", "locale").get("nodeContent").toLowerCase();
    var damPath = "";
    var pimPath = "";

    damPath += "https://wcp.panasonic.net/siteadmin#/content/dam/pim/";
    damPath += locale.split("_")[0] + "/" + locale.split("_")[1] + "/";
    damPath += smn.slice(0, 2) + "/";
    damPath += smn.slice(0, 6) + "/" + smn;

    pimPath += "/content/pim/";
    pimPath += locale.split("_")[0] + "/" + locale.split("_")[1] + "/";
    pimPath += smn.slice(0, 2) + "/";
    pimPath += smn.slice(0, 6) + "/" + smn;

    return {
      isShow: smn !== "" && locale !== "",
      data: {
        dam: damPath,
        pim: pimPath
      }      
    }
  }.property(
    "model.nodes.@each.nodeContent"
  ),
  
  /*basicInfomation: function() {
    var data = this.get("model").get("nodes").filter(function(node) {
      return _.contains([
        "Short Model Number",
        "Unified Model Number",
        "catalogName",
        "Category",
        "GeneralData",
        "MarketingDescription",
        "DigitalAssets",
        "Overview",
        "Features",
        "GetInspired",
        "Accessory",
        "KeyTechnicalFeature",
        "Faceted",
        "GetInspired",
        "Accessory",
        "KeyTechnicalFeature",
        "Faceted",
        "Variation"
      ], node.get("attributeName"));
    });

    var isShow = false;

    data.forEach(function(record) {
      if (!record.get("isNull")) {
        isShow = true;
      }
    });

    return {
      isShow: isShow,
      data: data
    }
  }.property("model"),*/
  
  seeAllSpecs: function() {
    var data = this.get("model").get("nodes").findProperty("attributeName", "TechnicalFeature").get("childrenNode");
    var isShow = false;

    data.forEach(function(record) {
      if (!record.get("isNull")) {
        isShow = true;
      }
    });

    return {
      isShow: isShow,
      data: data
    }
  }.property("model.nodes.@each.nodeContent"),
  
  isBlank: function() {
    return (
      !this.get("basicInfomation").isShow &&
      !this.get("features").isShow &&
      !this.get("specifications").isShow &&
      !this.get("getInspired").isShow && 
      !this.get("accessoryItems").isShow && 
      !this.get("accessoryCategories").isShow && 
      !this.get("category").isShow && 
      !this.get("path").isShow && 
      !this.get("seeAllSpecs").isShow
    )
  }.property(
    "basicInfomation", 
    "features", 
    "specifications", 
    "getInspired", 
    "accessoryItems", 
    "accessoryCategories", 
    "category", 
    "path", 
    "seeAllSpecs"
  )

});

CQ5.NodesTechViewController = Ember.ArrayController.extend({
  sortProperties: ['index'],
  maxLevel: function() {
    var maxLevel = 0;
    
    this.get("nodesWithoutBlank").forEach(function(record) {
      if (record.get("level") > maxLevel) {
        maxLevel = record.get("level");
      }
    });
    
    return maxLevel;
  }.property("nodesWithoutBlank.@each.level"),

  nodesWithoutBlank: function() {
    var records = this.get("model").filter(function(node) {
      return !node.get("isNull");    
    });

    return Ember.ArrayController.create({
      content: records,
      sortProperties: ['index']
    });
  }.property("@each.nodeContent"),
  
  records: function() {
    var maxLevel = this.get("maxLevel");
    var model = this.get("nodesWithoutBlank");

    model.forEach(function(record, index) {
      var width = (maxLevel - record.get("level")) * 150 + 150;

      if (model.get("length") !== index + 1) {
        record.set("tableStyle", "border-bottom: 1px solid #dddddd;");
      } else {
        record.set("tableStyle", "border-bottom: 0px;");
      }
      
      record.set("tdStyle", "width: " + width + "px; border-top: 0px; border-right: 1px solid #dddddd; background-color: #f5f5f5;");
    });
    
    return this.get("nodesWithoutBlank");
  }.property("nodesWithoutBlank", "nodesWithoutBlank.@each.level", "nodesWithoutBlank.@each.index")
});

CQ5.NodesBasicEditTableController = Ember.ArrayController.extend({
  maxLevel: function() {
    var maxLevel = 0;
    
    this.get("model").forEach(function(record) {
      if (record.get("level") > maxLevel) {
        maxLevel = record.get("level");
      }
    });
    
    return maxLevel;
  }.property("@each.level"),
  
  records: function() {
    var maxLevel = this.get("maxLevel");
    var model = this.get("model");
    model.forEach(function(record, index) {
      var width = (maxLevel - record.get("level")) * 200 + 200;
      
      if (model.get("length") !== index + 1) {
        record.set("tableStyle", "border-bottom: 1px solid #dddddd;");
      } else {
        record.set("tableStyle", "border-bottom: 0px;");
      }
      
      record.set("tdStyle", "width: " + width + "px; border-top: 0px; border-right: 1px solid #dddddd; padding-top: 16px; background-color: #f5f5f5;");
    });
    
    return this.get("model");
  }.property("@each.nodeContent", "@each.level")
});

CQ5.NodesBasicViewTableController = Ember.ArrayController.extend({
  nodesWithoutBlank: function() {
    return this.get("model").filter(function(node) {
      return !node.get("isNull");    
    });
  }.property("@each.nodeContent")
});

CQ5.NodesTechEditTableController = Ember.ArrayController.extend({
  sortProperties: ['index'],
  
  newAttributeName: "",
  newTransAttributeName: "",
  newDataType: "",
  newNodeContent: "",
  actions: {
    addNode: function(childrenNode) {
      if (this.get("newTransAttributeName") === "") {
        alert('The "Trans Attr" field can not be left blank.');
        return;
      }
      var fileRecord = childrenNode.get("owner").get("file");
      var uniqueID = uuid.v4();
      var nodeRecord = this.get("store").createRecord('node', {
        id: uniqueID,
        index: (function() {
          var max = 0;
          childrenNode.forEach(function(childNode) {
            if (childNode.get("index") > max) {
              max = childNode.get("index")
            }
          });
          return max + 1;
        })(),
        isAllowBlank: true,
        isAlertBlank: false,
        nodeType: this.get("newNodeContent") ? "data" : "dataGroup",
        isData: this.get("newNodeContent") !== "",
        nodeName: 'TechnicalFeature' + fileRecord.get('technicalFeatureMaxIndex'),
        attributeName: 'TechnicalFeature' + fileRecord.get('technicalFeatureMaxIndex'),
        transAttributeName: this.get("newTransAttributeName"),
        dataType: "string",
        nodeContent: this.get("newNodeContent")
      });

      fileRecord.set('technicalFeatureMaxIndex', fileRecord.get('technicalFeatureMaxIndex') + 1);
      
      childrenNode.addRecord(nodeRecord);
      fileRecord.get("nodes").addRecord(nodeRecord);
      
      // Clear textfield
      this.set("newTransAttributeName", "");
      this.set("newNodeContent", "");
    },
    delNode: function(nodeRecord) {
      if(confirm("Do you really want to delete this node?")) {
        nodeRecord.get("file").get("nodes").removeRecord(nodeRecord);
        if (nodeRecord.get("parentNode")) {
          nodeRecord.get("parentNode").get("childrenNode").removeRecord(nodeRecord);
        }
        nodeRecord.deleteRecord();
      }      
    }
  },
  
  // For Drag & Drop Feature
  
  updateSortOrder: function(indexes) {
    var nodeList = [];
    this.forEach(function(item) {
      nodeList.push(item);
    }, this);
    
    nodeList.forEach(function(item) {
      // console.log(item);
      var index = indexes[item.get('id')];
      item.set('index', index);
    }, this);
  }
});
