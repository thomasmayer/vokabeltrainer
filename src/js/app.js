var url = 'https://blockchain-poc.westeurope.cloudapp.azure.com:8545'; // url for azure parity instance node0
var urlAzure = 'https://verswechselapi.azurewebsites.net';
var urlLocal = 'http://localhost:3000';


App = {
    web3Provider: null,
    simpleContract: null,
    versWechselContract: null,
    html: null,
    vocabularyList: null,
    trainVocabulary: null,
    session_overall: 0,
    session_ok: 0,
    session_nok: 0,

    getCookie: function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },

    setCookie: function(cname, cvalue) {
        var d = new Date();
        var exdays = 60;
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    getEnv: function() {
        App.initEnvironment();
        console.log("getenv: " + App.getCookie("env"));
        return App.getCookie("env");
    },

    getUrl: function() {
        console.log("env cookie: " + App.getCookie("env"));

        if(App.getCookie("env") == "Azure") {
            return urlAzure;
        }
        else {
            return urlLocal;
        }
    },

    selectEnvironmentLocal: function() {
        console.log("set url to Local");
        App.setCookie("env", "Local");
    },

    selectEnvironmentAzure: function() {
        console.log("set url to Azure");
        App.setCookie("env", "Azure");
    },

    initEnvironment: function() {
        var env = App.getCookie("env");
      
        if(env == "") {
            App.setCookie("env", "Azure");
            env = "Azure";
        }
    },

    init: function() {
        console.log("init");
        //App.initEnvironment();
        App.readVocabularyList();
        return App.bindEvents();
    },  
  
    bindEvents: function() {
      console.log("bind events");
      
      $(document).on('click', '.btn-save-vocabulary', App.saveVocabulary);
      $(document).on('click', '.btn-check-vocabulary', App.checkVocabulary);

/*
      $("#setazure").click(function(event){
        event.preventDefault();
        App.selectEnvironmentAzure();
        $('#env_text').text(App.getEnv());
        console.log("set azure env");
      });

      $("#setlocal").click(function(event){
        event.preventDefault();
        App.selectEnvironmentLocal();
        $('#env_text').text(App.getEnv());
        console.log("set local env");
      });
*/
    },

    postRequest: function(url, param) {
        console.log("post request: " + App.getUrl() + url);
        var req = new XMLHttpRequest();

        req.open("POST", App.getUrl() + url, false);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(param));

        console.log("response: " + req.responseText);
    
        return req.responseText;
    },

    getRequest: function(url) {
        console.log("get request: " + App.getUrl() + url);
        var req = new XMLHttpRequest();
        
        req.open("GET", App.getUrl() + url, false);
        req.send();

        console.log("response: " + req.responseText);

        return req.responseText;
    },

    readVocabularyList: function() {

        console.log("read");

        var url = "http://127.0.0.1:10002/devstoreaccount1/vocabulary?st=2018-06-27T16%3A58%3A15Z&se=2018-10-30T16%3A58%3A00Z&sp=raud&sv=2017-07-29&tn=vocabulary&sig=dtt5ZHHiu%2FNV2qLNZuVP7C92BWDo8lq2ZWqx0XtMNCg%3D";

        var req = new XMLHttpRequest();
        
        req.open("GET", url, false);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("payloadFormat", "application/json;odata=nometadata");
        req.send();

        console.log("response: " + req.responseText);

        var r = JSON.parse(req.responseText);

        vocabularyList = r.value;
    },
  
    saveVocabulary: function(event) {

        console.log("saveVocabulary");

       var url = "http://127.0.0.1:10002/devstoreaccount1/vocabulary?st=2018-06-27T16%3A58%3A15Z&se=2018-10-30T16%3A58%3A00Z&sp=raud&sv=2017-07-29&tn=vocabulary&sig=dtt5ZHHiu%2FNV2qLNZuVP7C92BWDo8lq2ZWqx0XtMNCg%3D";


        var requestJson = { 
            "german" : $("#german").val(),
            "english" : $("#english").val(),
            "PartitionKey" :"mypartitionkey",  
            "RowKey" : $("#german").val(),
            "train_overall" : 0,
            "train_ok" : 0
        };

        var req = new XMLHttpRequest();

        req.open("POST", url, false);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(requestJson));

        console.log("response: " + req.responseText);

        App.readVocabularyList();

        console.log("saveVocabulary done");
    },

    listVocabulary: function(event) {    
        console.log("listVocabulary");

        for(t = 0; t < vocabularyList.length; t++) {
            var e = vocabularyList[t];
            html = '<tr><td>' + vocabularyList[t].german + '</td><td>' + vocabularyList[t].english + '</td><td>' + vocabularyList[t].train_overall + '</td><td>' + vocabularyList[t].train_ok + '</td></tr>';
            $('#vocabulary-table tr').last().after(html);
        }
    },

    updateVocabulary: function(result) {
        var url = "http://127.0.0.1:10002/devstoreaccount1/vocabulary(PartitionKey='mypartitionkey',RowKey='"
        url += App.trainVocabulary.RowKey + "')";
        url += "st=2018-06-27T16%3A58%3A15Z&se=2018-10-30T16%3A58%3A00Z&sp=raud&sv=2017-07-29&tn=vocabulary&sig=dtt5ZHHiu%2FNV2qLNZuVP7C92BWDo8lq2ZWqx0XtMNCg%3D";

        console.log("url: " + url);

        var count = App.trainVocabulary.train_ok;

        if(result === "ok") {
            count++;
        }

        var requestJson = { 
            "german" : App.trainVocabulary.german,
            "english" : App.trainVocabulary.english,
            "PartitionKey" : App.trainVocabulary.PartitionKey,  
            "RowKey" : App.trainVocabulary.RowKey,
            "train_overall" : App.trainVocabulary.train_overall + 1,
            "train_ok" : count
        };

        var req = new XMLHttpRequest();

        req.open("PUT", url, false);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(requestJson));

        console.log("response: " + req.responseText);

        App.readVocabularyList();
    },

    checkVocabulary: function(event) {    
        console.log("checkVocabulary");
        var e = $("#train_english").val();
        App.session_overall++;
        $("#stat_overall").val(App.session_overall);
        console.log("typed: " + e);

        if(e === App.trainVocabulary.english) {
            App.session_ok++;
            $("#stat_ok").val(App.session_ok);
            $("#result_ok").show();
            $("#result_ok").fadeOut(4000);
            $("#result_nok").hide();
//            alert("Richtig!!");
            App.updateVocabulary("ok");
            App.trainVocabulary = App.loadVocabulary();;
            console.log("trainVocabulary: " + App.trainVocabulary);
            $("#train_german").val(App.trainVocabulary.german);
            $("#train_english").val("");
        }
        else {
            App.session_nok++;
            $("#stat_nok").val(App.session_nok);

            $("#result_nok").show();
            $("#result_ok").hide();
            $("#result_nok").fadeOut(4000);
//            alert("Falsch!!");
            App.updateVocabulary("nok");
            $("#train_english").val("");
        }

    },

    loadVocabulary: function() {
        var index = Math.floor((Math.random() * vocabularyList.length) + 1);
        console.log("index: " + index);
        var item = vocabularyList[index];

        return item;
    },

    onOverviewLoad: function(event) {
        console.log("overview app loaded");
        App.listVocabulary();
    },

    onTrainLoad: function(event) {
        console.log("train");
        App.trainVocabulary = App.loadVocabulary();;
        $("#stat_overall").val(App.session_overall);
        $("#stat_nok").val(App.session_nok);
        $("#stat_ok").val(App.session_ok);
        console.log("trainVocabulary: " + App.trainVocabulary);
        $("#train_german").val(App.trainVocabulary.german);
    },
};


  $(function() {
    
    $(window).load(function() {
      App.init();
      
    });

    $(document).ready(function() { 
        $('#env_text').text(App.getEnv());
        console.log("env set: " + App.getEnv());
    });
  });
  