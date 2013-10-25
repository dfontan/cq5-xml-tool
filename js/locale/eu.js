CQ5.localeManager.register(
  function(xmlDoc) {
    if (xmlDoc.find("processInformation").text().length > 0) {
      return true;
    }
  },
  [{
    "attributeName": "Short Model Number",
    "modifiedContent": function (store, node, xmlDoc) {
      return xmlDoc.find("shortModelNumber").text();
    }
  },{
    "attributeName": "Unified Model Number",
    "modifiedContent": function (store, node, xmlDoc) {
      return xmlDoc.find("shortModelNumber").text();
    }
  },{
    "attributeName": "Model Number",
    "modifiedContent": function (store, node, xmlDoc) {
      return xmlDoc.find("shortModelNumber").text();
    }
  },{
    "attributeName": "Model Name",
    "modifiedContent": function (store, node, xmlDoc) {
      return xmlDoc.find("shortModelNumber").text();
    }
  },{
    "attributeName": "locale",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("product").attr("countryCode").toLowerCase() + "_" + xmlDoc.find("product").attr("languageCode").toLowerCase();
    }
  },{
    "attributeName": "Full Product Name",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("modelName").text();
    }
  },{
    "attributeName": "Description For See All",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("shortDescription").text();
    }
  },{
    "attributeName": "Key Copy",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("modelName").text();
    }
  },{
    "attributeName": "Key Specs 1",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("salesArguments > salesArgument:eq(0)").text();
    }
  },{
    "attributeName": "Key Specs 2",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("salesArguments > salesArgument:eq(1)").text();
    }
  },{
    "attributeName": "Key Specs 3",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("salesArguments > salesArgument:eq(2)").text();
    }
  },{
    "attributeName": "AccessoryItems",
    "modifiedContent": function (store, node, xmlDoc) {
      var fileRecord = node.get("file");    
      $(xmlDoc).find("accessory").each(function(index) {
        var accessoryItem = fileRecord.get("nodes").findProperty("attributeName", "Accessory Model Number " + (index + 1));
        if (accessoryItem) {
          accessoryItem.set("nodeContent", $(this).text());
        }        
      });

      return null;
    }
  },{
    "attributeName": "Sub Copy",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("shortDescription").text();
    }
  },{
    "attributeName": "Product Image",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("shortModelNumber").text() + "_Spec.png";
    }
  },{
    "attributeName": "Variation Image for See All 1",
    "modifiedContent": function (store, node, xmlDoc) {      
      return xmlDoc.find("shortModelNumber").text() + "_SeeAll.png";
    }
  },{
    "attributeName": "Short Description",
    "modifiedContent": function (store, node, xmlDoc) {
      return xmlDoc.find("shortDescription:eq(0)").text();
    }
  },{
    "attributeName": "TechnicalFeature",
    "modifiedContent": function (store, node, xmlDoc) {
      var rootNode = $(xmlDoc).find("technicalFeatures");      
      var count = 0;
      var fileRecord = node.get("file");
      
      var func = function(xmlNode, record) {
        xmlNode.children().each(function(index, e) {
          var uniqueID = uuid.v4();
          if (e.nodeName == "group") {

            var newRecord = store.createRecord('node', {
              id: uniqueID,
              index: count++,
              nodeType: "dataGroup",
              isData: false,
              isAllowBlank: true,
              isAlertBlank: false,
              nodeName: 't' + uniqueID.replace(/-/g,""),
              attributeName: 't' + uniqueID.replace(/-/g,""),
              transAttributeName: $(this).find("groupName").text(),
              dataType: "string",
            });
            

            record.get("childrenNode").addRecord(newRecord);
            fileRecord.get("nodes").addRecord(newRecord);

            func($(this), newRecord);
          } else if (e.nodeName == "technicalFeature") {
            var newRecord = store.createRecord('node', {
              id: uniqueID,
              index: count++,
              nodeType: "data",
              isData: true,
              isAllowBlank: true,
              isAlertBlank: false,
              nodeName: 't' + uniqueID.replace(/-/g,""),
              attributeName: 't' + uniqueID.replace(/-/g,""),
              transAttributeName: $(this).find("featureName").children("text").text(),
              dataType: "string",
              nodeContent: $(this).find("featureValue:eq(0)").children("text").text()
            });
            record.get("childrenNode").addRecord(newRecord);
            fileRecord.get("nodes").addRecord(newRecord);
          }
        });
      };
      
      func(rootNode, node);
      return null;
    }
  }]
);