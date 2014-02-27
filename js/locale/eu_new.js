CQ5.localeManager.register(
  function(xmlDoc) {
    if (xmlDoc.find('dataGroup[nodeName="DigitalAssets"]').text().trim().length > 0 && xmlDoc.find('data[nodeName="KeyCopy"]').text().trim().length === 0) {
      return true;
    }
  },[/*{
    attributeName: "KeyTechnicalFeature",
    modifiedContent: function (store, node, xmlDoc) {
      var fileRecord = node.get("file");
      var uniqueID = uuid.v4();

      if (node.get("childrenNode").findProperty("nodeName", "KeySpecsValue1")) {
        return "";
      }

      for (var i = 0; i < 3; i++) {
        var keySpecs = store.createRecord('node', {
          id: uniqueID,
          nodeType: "data",
          isData: true,
          isAllowBlank: true,
          isAlertBlank: false,
          nodeName: 'KeySpecs' + (i + 1),
          attributeName: 'Key Specs ' + (i + 1),
          transAttributeName: 'Key Specs ' + (i + 1),
          dataType: "string",
          nodeContent: $(xmlDoc).find('data[attributeName="Sales Argument"]:eq(' + i + ')').text()
        });

        var keySpecsValue = store.createRecord('node', {
          id: uniqueID,
          nodeType: "data",
          isData: true,
          isAllowBlank: true,
          isAlertBlank: false,
          nodeName: 'KeySpecsValue' + (i + 1),
          attributeName: 'Key Specs Value ' + (i + 1),
          transAttributeName: 'Key Specs Value ' + (i + 1),
          dataType: "string",
          nodeContent: ""
        });
        node.get("childrenNode").addRecord(keySpecs);
        node.get("childrenNode").addRecord(keySpecsValue);
        fileRecord.get("nodes").addRecord(keySpecs);
        fileRecord.get("nodes").addRecord(keySpecsValue);
      };      
    }
  }*/,{
    attributeName: "Description For See All",
    modifiedContent: function (store, node, xmlDoc) {
      return $(xmlDoc).find('data[nodeName="ShortDescription"]:eq(0)').text();
    }
  },{
    attributeName: "Model Number",
    modifiedContent: function (store, node, xmlDoc) {
      return $(xmlDoc).find('data[nodeName="ShortModelNumber"]:eq(0)').text();
    }
  },{
    attributeName: "Product Image",
    modifiedContent: function (store, node, xmlDoc) {
      return $(xmlDoc).find('data[nodeName="ShortModelNumber"]:eq(0)').text() + "_Spec.png";
    }
  },{
    attributeName: "Variation",
    modifiedContent: function (store, node, xmlDoc) {
      var fileRecord = node.get("file");
      var uniqueID = uuid.v4();

      if (node.get("childrenNode").findProperty("nodeName", "VariationImageforSeeAll1")) {
        return "";
      }

      var record = store.createRecord('node', {
        id: uniqueID,
        nodeType: "data",
        isData: true,
        isAllowBlank: true,
        isAlertBlank: false,
        nodeName: 'VariationImageforSeeAll1',
        attributeName: 'Variation Image for See All 1',
        transAttributeName: 'Variation Image for See All 1',
        dataType: "string",
        nodeContent: $(xmlDoc).find('data[nodeName="ShortModelNumber"]:eq(0)').text() + "_SeeAll.png"
      });
      node.get("childrenNode").addRecord(record);
      fileRecord.get("nodes").addRecord(record);
    }
  },{
    attributeName: "Key Copy",
    modifiedContent: function (store, node, xmlDoc) {
      return $(xmlDoc).find('data[nodeName="ModelName"]:eq(0)').text();
    }
  },{
    attributeName: "Sub Copy",
    modifiedContent: function (store, node, xmlDoc) {
      return $(xmlDoc).find('data[nodeName="ShortDescription"]:eq(0)').text();
    }
  },{
    attributeName: "Full Product Name",
    modifiedContent: function (store, node, xmlDoc) {
      return $(xmlDoc).find('data[nodeName="ShortModelNumber"]:eq(0)').text() + " " +
             $(xmlDoc).find('data[nodeName="ModelName"]:eq(0)').text();
    }
  }]
);