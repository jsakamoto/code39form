var Code39Form;
(function (Code39Form) {
    var storageService = initializeStorageService();
    var inputLinesJson = storageService.get('inputLines') || '[{"id":1,"text":""}]';
    var inputLines = JSON.parse(inputLinesJson);
    var $inputLinesContainer = $('.input-lines-container');
    var source = $("#line-template").html();
    var template = Handlebars.compile(source);
    var langPack = (Code39Form.languagePacks || {})[window.navigator.language] || {};
    inputLines.forEach(function (inputLine) {
        var html = template(inputLine);
        $inputLinesContainer.append(html);
        updateBarcodeImage(inputLine);
    });
    updateUIState();
    var userAgentParts = window.navigator.userAgent.split(/[ ,/;:()]/);
    var browserIsKindle = userAgentParts.indexOf('Kindle') != -1;
    $(document.body).toggleClass('print-disabled', browserIsKindle);
    var matches = location.hostname.match(/^([^.]+)\.github\.io$/i);
    if (matches != null) {
        var ownerName = matches[1];
        var projectName = location.pathname.split('/').filter(function (s) { return s != ''; }).shift();
        var repositoryUrl = "https://github.com/" + ownerName + "/" + projectName;
        var source_1 = $("#repository-info-template").html();
        var template_1 = Handlebars.compile(source_1);
        var html = template_1({ repositoryUrl: repositoryUrl });
        $('.repository-info').html(html);
    }
    $(document).on('click', '.add-input-line', function () {
        var newId = inputLines.map(function (l) { return l.id; }).reduce(function (prev, current) { return Math.max(prev, current); }) + 1;
        var newLine = { id: newId, text: '' };
        var html = template(newLine);
        $inputLinesContainer.append(html);
        inputLines.push(newLine);
        storageService.put('inputLines', JSON.stringify(inputLines));
        updateUIState();
        setFocus(newId);
    });
    $(document).on('click', '.remove-input-line:not(.disabled)', function (e) {
        var $inputLine = $(e.target).closest('.input-line');
        var lineId = $inputLine.data('line-id');
        if ($('.input-line').length < 2)
            return;
        var prompt = 'Are you sure you want to remove it?';
        if (!confirm(langPack[prompt] || prompt)) {
            setFocus(lineId);
            return;
        }
        $inputLine.remove();
        var inputLine = inputLines.filter(function (line) { return line.id == lineId; }).pop();
        var index = inputLines.indexOf(inputLine);
        inputLines.splice(index, 1);
        storageService.put('inputLines', JSON.stringify(inputLines));
        updateUIState();
        setFocus((inputLines[index] || inputLines[inputLines.length - 1]).id);
    });
    $(document).on('change keydown paste', '.input-line .control input:text', function (e) {
        var $inputLine = $(e.target).closest('.input-line');
        var lineId = $inputLine.data('line-id');
        var input = e.target;
        setTimeout(function () {
            var newText = input.value.toUpperCase();
            var inputLine = inputLines.filter(function (line) { return line.id == lineId; }).pop();
            if (inputLine != undefined && inputLine.text != newText) {
                inputLine.text = newText;
                updateBarcodeImage(inputLine);
                storageService.put('inputLines', JSON.stringify(inputLines));
            }
        }, 0);
    });
    $(document).on('click', '.print', function () {
        window.print();
    });
    function updateBarcodeImage(inputLine) {
        var $inputLine = $('div[data-line-id=' + inputLine.id + ']');
        $('.barcode-image', $inputLine).html('').barcode(inputLine.text, 'code39', { barWidth: 3, showHRI: false });
        $('.human-readable .content', $inputLine).text(inputLine.text);
    }
    function updateUIState() {
        $('.remove-input-line').toggleClass('disabled', inputLines.length < 2);
        localizeText(langPack);
    }
    function setFocus(id) {
        $("#barcode-input-" + id).focus();
    }
    function initializeStorageService() {
        var enableLocalStorage = (typeof (localStorage) !== 'undefined');
        var storageService = null;
        if (enableLocalStorage == true) {
            storageService = {
                get: function (key) { return localStorage.getItem(key); },
                put: function (key, value) { return localStorage.setItem(key, value); }
            };
        }
        else {
            storageService = {
                get: function (key) { return $.cookie(key); },
                put: function (key, value) { return $.cookie(key, value); }
            };
        }
        return storageService;
    }
    function localizeText(langPack) {
        $('.x-lang').each(function (i, elem) {
            var text = $(elem).text();
            $(elem).text(langPack[text] || text).removeClass('.x-lang');
        });
    }
    window.onerror = function (message, url, lineNumber, columnNumber, exception) {
        exception = exception || { message: message, stack: (url || '- unknown souce file -') + "(" + lineNumber + ":" + columnNumber + ")" };
        alert(exception);
    };
})(Code39Form || (Code39Form = {}));

//# sourceMappingURL=index.js.map
