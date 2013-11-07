/* ========================================================================
 * CQ5 Xml Tool: model.js v1.0.0
 * By Nathan
 * iNotes & Sametime: xuhangdl@cn.ibm.com
 * ======================================================================== */
 
CQ5.File = DS.Model.extend({
  name: function() {
    var SMN = "";

    this.get("nodes").forEach(function(nodeRecord) {
      if (nodeRecord.get("attributeName") == "Short Model Number") {
        SMN = nodeRecord.get("nodeContent");
      }
    });

    return (SMN !== "" ? SMN : "###") + "_" + this.get("locale").toLowerCase();
  }.property("nodes.@each.nodeContent"),

  xmlString: DS.attr('string'),

  technicalFeatureMaxIndex: DS.attr('number'),

  convertedXmlString: function() {
    var xmlDocument = document.implementation.createDocument("", "", null);

    var createXmlElement = function(nodeRecord) {
      var element = xmlDocument.createElement(nodeRecord.get("nodeType"));
      if (nodeRecord.get("nodeName")) {
        element.setAttribute("nodeName", nodeRecord.get("nodeName"));
      }
      if (nodeRecord.get("attributeName")) {
        element.setAttribute("attributeName", nodeRecord.get("attributeName"));
      }
      if (nodeRecord.get("transAttributeName")) {
        element.setAttribute("transAttributeName", nodeRecord.get("transAttributeName"));
      }
      if (nodeRecord.get("dataType")) {
        element.setAttribute("dataType", nodeRecord.get("dataType"));
      }
      if (nodeRecord.get("isData")) {
        if (nodeRecord.get("nodeContent")) {
          element.appendChild(xmlDocument.createCDATASection(nodeRecord.get("nodeContent")));
        }        
      } else {
        var childrenNode = [];

        nodeRecord.get("childrenNode").forEach(function(childNode) {
          childrenNode.push(childNode);
        });

        childrenNode = _.sortBy(childrenNode, function(childNode){ return childNode.get("index"); });

        childrenNode.forEach(function(childNode) {
          var childElement = createXmlElement(childNode);
          element.appendChild(childElement);
        });        
      }
      return element;
    };

    var rootNodeRecord = this.get("nodes").findProperty("nodeType", "ItemContents");
    xmlDocument.appendChild(createXmlElement(rootNodeRecord));   
    
    // XML string beautifing
    var beautifiedString = vkbeautify.xml('<?xml version="1.0" encoding="UTF-8"?>' + (new XMLSerializer()).serializeToString(xmlDocument));
    
    return beautifiedString;
  }.property(
    "nodes.@each.index",
    "nodes.@each.attributeName",
    "nodes.@each.transAttributeName",
    "nodes.@each.dataType",
    "nodes.@each.nodeContent"
  ),

  csvString: function() {
    var csvString = '', content = "";

    var append = function(nodeRecord) {
      if (nodeRecord.get("transAttributeName") !== undefined) {
        if (nodeRecord.get("nodeContent") === null) {
          content = "";
        } else {
          content = nodeRecord.get("nodeContent").replace("\"", "\"\"");
        }

        csvString += "\"" + (nodeRecord.get("transAttributeName")) + "\",\"" + (content || "") + "\"\n";
      }      

      if (!nodeRecord.get("isData")) {
        var childrenNode = [];

        nodeRecord.get("childrenNode").forEach(function(childNode) {
          childrenNode.push(childNode);
        });

        childrenNode = _.sortBy(childrenNode, function(childNode){ return childNode.get("index"); });

        childrenNode.forEach(function(childNode) {
          append(childNode);
        });        
      }
    };

    var rootNodeRecord = this.get("nodes").findProperty("nodeType", "ItemContents");
    append(rootNodeRecord); 

    return csvString;
  }.property(
    "nodes.@each.index",
    "nodes.@each.attributeName",
    "nodes.@each.transAttributeName",
    "nodes.@each.dataType",
    "nodes.@each.nodeContent"
  ),

  locale: function() {
    var localeCode = "";

    this.get("nodes").forEach(function(nodeRecord) {
      if (nodeRecord.get("attributeName") == "locale") {
        localeCode = nodeRecord.get("nodeContent");
      }
    });

    return localeCode !== "" ? localeCode : "###";
  }.property("nodes.@each.nodeContent"),

  nodes: DS.hasMany('node', {
    inverse: 'file'
  })
});

CQ5.Node = DS.Model.extend({
  index: DS.attr("number"),
  file: DS.belongsTo('file', {
    inverse: 'nodes'
  }),
  
  level: function() {
    if (!this.get("isData")) {
      var maxChildHeight = 1;
      this.get("childrenNode").forEach(function(record, index) {
        if (record.get("level") > maxChildHeight) {
          maxChildHeight = record.get("level");
        }
      });      
      return maxChildHeight + 1;
    } else {
      return 1;
    }
  }.property("isData", "childrenNode.@each.isData", "childrenNode.@each.level"),
  
  isNull: function() {
    if (this.get("isData")) {
      if (!this.get("nodeContent")) {
        return true;
      }
    } else {
      var isNull = true;
      
      if (this.get("childrenNode").get("length") === 0) {
        return true;
      }
      
      this.get("childrenNode").forEach(function(childNode) {
        if (!childNode.get("isNull")) {
          isNull = false;
        }
      });
      
      return isNull;
    }
  }.property("nodeContent", "childrenNode.@each.isNull"),

  isAllowBlank: DS.attr('boolean'),

  isError: function() {
    return !this.get("isAllowBlank") && this.get("isNull");
  }.property("nodeContent"),

  isAlert: function() {
    return this.get("isAlertBlank") && this.get("isNull");
  }.property("nodeContent"),

  nodeType: DS.attr('string'),
  
  isData: function() {
    return this.get("nodeType") == "data";
  }.property("nodeType"),

  nodeName: DS.attr('string'),
  attributeName: DS.attr('string'),
  transAttributeName: DS.attr('string'),
  dataType: DS.attr('string'),
  
  nodeContent: DS.attr('string'),
  parentNode: DS.belongsTo('node', {
    inverse: 'childrenNode'
  }),
  childrenNode: DS.hasMany('node', {
    inverse: 'parentNode'
  })
});