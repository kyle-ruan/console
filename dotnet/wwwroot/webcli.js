class WebCLI{
  constructor(){
    var self = this;
    self.history = [];
    self.cmdOffset = 0;
    self.createElements();
    self.wireEvents();
  }

  wireEvents(){
    var self =  this;

    self.keyDownHandler = function(e){
      self.onKeyDown(e);
    };

    self.clickHandler = function(e){
      self.onClick(e);
    };

    document.addEventListener('keydown', self.keyDownHandler);
    self.ctrlEl.addEventListener('click', self.clickHandler);
  }

  onClick(){
    this.focus();
  }

  onKeyDown(e){
    var self = this;
    var ctrlStyle = self.ctrlEl.style;

    if(e.ctrlKey && e.keyCode === 192){
      if(ctrlStyle.display === 'none'){
        ctrlStyle.display = '';
        self.focus();
      }
      else{
        ctrlStyle.display = 'none';
      }

      return;
    }

    if(self.inputEl === document.activeElement){
      switch (e.keyCode) {
        case 13:
          return self.runCmd();

        case 38:
          if((self.history.length + self.cmdOffset) > 0){
            self.cmdOffset--;
            self.inputEl.value = self.history[self.history.length+self.cmdOffset];
            e.preventDefault();
          }
          break;

        case 40:
          if(self.cmdOffset < -1){
            self.cmdOffset++;
            self.inputEl.value = self.history[self.history.length+self.cmdOffset];
            e.preventDefault();
          }
          break;

        default:
          break;
      }
    }
  }

  runCmd(){
    var self = this, txt = self.inputEl.value.trim();

    self.cmdOffset = 0;
    self.inputEl.value = "";
    self.writeLine(txt, "cmd");
    if(txt === ''){
      return;
    }
    self.history.push(txt);

    // Client command:
    var tokens = txt.split(' ');
    var cmd = tokens[0].toUpperCase();

    if(cmd === 'CLS'){
      self.outputEl.innerHTML = "";
      return;
    }

    if(cmd === 'IMG'){
      self.writeHtml('<img src="https://www.google.com.au/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"/>');
      return;
    }
    // Server command:
    fetch('/api/webcli',
    {
      method:"post",
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({cmdLine:txt})
    })
    .then(function(response){
        return response.json();
    })
    .then(function(result){
      var output = result.output;
      var style = result.isError ? 'error' : 'ok';

      if(result.isHTML){
        self.writeHTML(output);
      }
      else{
        self.writeLine(output, style);
      }
    })
    .catch(function(){
      self.writeLine('Error sending request to server', 'error');
    });
  }

  focus(){
    this.inputEl.focus();
  }

  scrollToBottom(){
    this.ctrlEl.scrollTop = this.ctrlEl.scrollHeight;
  }

  newLine(){
    this.outputEl.appendChild(document.createElement('br'));

    this.scrollToBottom();
  }

  writeLine(txt, cssSuffix){
    var span = document.createElement('span');

    cssSuffix = cssSuffix || 'ok';
    span.className = 'webcli-' + cssSuffix;
    span.innerText = txt;
    this.outputEl.appendChild(span);
    this.newLine();
  }

  writeHtml(markup){
    var div = document.createElement('div');
    div.innerHTML = markup;

    this.outputEl.appendChild(div);
    this.newLine();
  }

  createElements(){
    var self=this, doc = document;

    self.ctrlEl = doc.createElement("div");
    self.outputEl = doc.createElement("div");
    self.inputEl = doc.createElement("input");

    self.ctrlEl.className = "webcli";
    self.outputEl.className = "webcli-output";
    self.inputEl.className = "webcli-input";

    self.inputEl.setAttribute("spellcheck", "false");

    self.ctrlEl.appendChild(self.outputEl);
    self.ctrlEl.appendChild(self.inputEl);

    self.ctrlEl.style.display = "none";
    doc.body.appendChild(self.ctrlEl);
  }
}
