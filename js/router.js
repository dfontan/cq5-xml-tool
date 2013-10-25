/* ========================================================================
 * CQ5 Xml Tool: router.js v1.0.0
 * By Nathan
 * iNotes & Sametime: xuhangdl@cn.ibm.com
 * ======================================================================== */

CQ5.ApplicationRoute = Ember.Route.extend({
  init: function() {
    $.get("xml/template.xml", function(xmlDocument) {
      CQ5.xmlTemplateDocument = $(xmlDocument);
    });
  }
});

CQ5.FilesRoute = Ember.Route.extend({
});

CQ5.FilesIndexRoute = Ember.Route.extend({
  model: function() {
    return this.get("store").find("file");
  }
});

CQ5.FileRoute = Ember.Route.extend({
});

CQ5.FileXmlRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set('model', this.controllerFor('file').get('model'));
  }
});

CQ5.FileEditRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set('model', this.controllerFor('file').get('model'));
  }
});

CQ5.FileIndexRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set('model', this.controllerFor('file').get('model'));
  }
});