/* ========================================================================
 * CQ5 Xml Tool: view.js v1.0.0
 * By Nathan
 * iNotes & Sametime: xuhangdl@cn.ibm.com
 * ======================================================================== */
 
CQ5.FileSelectView = Ember.View.extend({
  change: function(event) {    
    this.get("controller").send("fileSelected", event.target.files);    
  }
});

CQ5.RawXmlString = Ember.View.extend({
  didInsertElement: function(event) {    
    prettyPrint();
  }
});

CQ5.FileView = Ember.View.extend({
  didInsertElement: function() {
    // Keyboard shortcuts configuration
    /*    
    Mousetrap.bind(['f f'], function(e) {
        location.href = "#Features";
        return false;
    });
    
    Mousetrap.bind(['f 1'], function(e) {
        location.href = "#Feature1";
        return false;
    });
    
    Mousetrap.bind(['f 2'], function(e) {
        location.href = "#Feature2";
        return false;
    });
    
    Mousetrap.bind(['f 3'], function(e) {
        location.href = "#Feature3";
        return false;
    });
    
    Mousetrap.bind(['f 4'], function(e) {
        location.href = "#Feature4";
        return false;
    });
    
    Mousetrap.bind(['f 5'], function(e) {
        location.href = "#Feature5";
        return false;
    });
    
    Mousetrap.bind(['t'], function(e) {
        location.href = "#techInfomation";
        return false;
    });
    
    Mousetrap.bind(['s'], function(e) {
        location.href = "#ShortModelNumber";
        return false;
    });
    
    Mousetrap.bind(['o'], function(e) {
        location.href = "#Overview";
        return false;
    });
    
    Mousetrap.bind(['g'], function(e) {
        location.href = "#GeneralData";
        return false;
    });
    
    Mousetrap.bind(['v'], function(e) {
        location.href = "#Variation";
        return false;
    });
    */
  }
});

CQ5.NodesTechEditTableView = Ember.View.extend({
  didInsertElement: function() {
    // Make records sorted after view rendered
    var controller = this.get('controller');
    this.$(".sortable").sortable({
      items: 'tr.item', //jQuery selector
      update: function(event, ui) {
        var indexes = {};
        $(this).find('.item').each(function(index) {
          indexes[$(this).data('id')] = index;
        });

        $(this).sortable('cancel');
        controller.updateSortOrder(indexes);
      }
    });
  }
});

CQ5.FileEditView = Ember.View.extend({
  didInsertElement: function() {
    this.$("table").on('change', "tr textarea", function(e) {
      $(this).val($(this).val().replace(/\s+/g, ' ').trim()).trigger('autosize.resize');;

      var punctuationPatten = /([\uFF0C\u3002\uFF1F\uFF1A\uFF1B\u2018\u2019\uFF01\u201C\u201D\u2014\u2026\u2026\u3001\uFF0D\uFF08\uFF09\u3010\u3011\u300A\u300B]+)/g;
      if (punctuationPatten.test($(this).val())) {
        alertify.log("Chinese punctuation detected, if the site does not belong to the Chinese language, please remove the Chinese punctuation marks.");
      }

      e.stopPropagation();
    });
  }
});


CQ5.TextAreaView = Ember.TextArea.extend({
  didInsertElement: function(evt) {
    this.$().autosize();
  }
});

Ember.Handlebars.helper('cq5-textarea', CQ5.TextAreaView);