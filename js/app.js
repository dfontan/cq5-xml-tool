/* ========================================================================
 * CQ5 Xml Tool: app.js v1.0.0
 * By Nathan
 * iNotes & Sametime: xuhangdl@cn.ibm.com
 * ======================================================================== */

 
// EMBER APPLICATION CREATION
// ==========================
CQ5 = Ember.Application.create();

// EMBER LOCAL STORAGE ADAPTER DEFINATION
// ======================================
CQ5.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'CQ5'
});

// EMBER ROUTER DEFINATION
// =======================
CQ5.Router.map(function () {
  this.resource('files', { path: '/' }, function () {
    this.resource('file', { path: '/file/:file_id' }, function () {
      this.route('xml');
      this.route('edit');
    });
  });
});

// EMBER LOCALEMANAGER DEFINATION
// ==============================
CQ5.LocaleManager = Ember.Object.extend({
  localeMap: [],
  
  register: function(recognizeFunction, convertList) {
    this.get("localeMap").push({
      recognizeFunction: recognizeFunction,
      convertList: convertList
    });
  },
  
  recognize: function(xmlDocument) {
    var convertList;
    _.each(this.get("localeMap"), function(locale, key, list) {
      if (locale.recognizeFunction(xmlDocument)) {
        convertList = locale.convertList;
      }
    });

    return convertList;
  }
});

CQ5.localeManager = CQ5.LocaleManager.create();