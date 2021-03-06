
namespace Code39Form {

    interface InputLine {
        id: number;
        text: string;
    }

    interface StorageService {
        get(key: string): string;
        put(key: string, value: string): void;
    }

    // Initialize storage service.
    let storageService = initializeStorageService();

    let inputLinesJson = storageService.get('inputLines') || '[{"id":1,"text":""}]';
    let inputLines = JSON.parse(inputLinesJson) as InputLine[];

    let $inputLinesContainer = $('.input-lines-container');

    // Prepare template.
    let source = $("#line-template").html();
    let template = Handlebars.compile(source);

    var langPack = (languagePacks || {})[window.navigator.language] || {};

    // Initial display view.
    inputLines.forEach(inputLine => {
        let html = template(inputLine);
        $inputLinesContainer.append(html);
        updateBarcodeImage(inputLine);
    });
    updateUIState();

    let userAgentParts = window.navigator.userAgent.split(/[ ,/;:()]/);
    let browserIsKindle = userAgentParts.indexOf('Kindle') != -1;
    $(document.body).toggleClass('print-disabled', browserIsKindle);

    // Show repository information if I'm on GitHub pages.
    var matches = location.hostname.match(/^([^.]+)\.github\.io$/i);
    if (matches != null) {
        let ownerName = matches[1];
        let projectName = location.pathname.split('/').filter(s => s != '').shift();
        let repositoryUrl = `https://github.com/${ownerName}/${projectName}`;
        let source = $("#repository-info-template").html();
        let template = Handlebars.compile(source);
        let html = template({ repositoryUrl });
        $('.repository-info').html(html);
    }

    // Wire up event handlers.

    $(document).on('click', '.add-input-line', () => {
        let newId = inputLines.map(l => l.id).reduce((prev, current) => Math.max(prev, current)) + 1;
        let newLine = { id: newId, text: '' };
        let html = template(newLine);
        $inputLinesContainer.append(html);

        inputLines.push(newLine);
        storageService.put('inputLines', JSON.stringify(inputLines));
        updateUIState();
        setFocus(newId);
    });

    $(document).on('click', '.remove-input-line:not(.disabled)', (e) => {
        let $inputLine = $(e.target).closest('.input-line');
        let lineId = $inputLine.data('line-id');
        if ($('.input-line').length < 2) return;
        let prompt = 'Are you sure you want to remove it?';
        if (!confirm(langPack[prompt] || prompt)) {
            setFocus(lineId);
            return;
        }

        $inputLine.remove();

        let inputLine = inputLines.filter(line => line.id == lineId).pop();
        let index = inputLines.indexOf(inputLine);
        inputLines.splice(index, 1);

        storageService.put('inputLines', JSON.stringify(inputLines));
        updateUIState();
        setFocus((inputLines[index] || inputLines[inputLines.length - 1]).id);
    });

    $(document).on('change keydown paste', '.input-line .control input:text', (e) => {
        let $inputLine = $(e.target).closest('.input-line');
        let lineId = $inputLine.data('line-id') as number;
        let input = e.target as HTMLInputElement;
        setTimeout(() => {
            let newText = input.value.toUpperCase();
            let inputLine = inputLines.filter(line => line.id == lineId).pop();
            if (inputLine != undefined && inputLine.text != newText) {
                inputLine.text = newText;
                updateBarcodeImage(inputLine);
                storageService.put('inputLines', JSON.stringify(inputLines));
            }

        }, 0);
    });

    $(document).on('click', '.print', () => {
        window.print();
    });

    function updateBarcodeImage(inputLine: InputLine): void {
        let $inputLine = $('div[data-line-id=' + inputLine.id + ']');
        $('.barcode-image', $inputLine).html('').barcode(inputLine.text, 'code39', { barWidth: 3, showHRI: false });
        $('.human-readable .content', $inputLine).text(inputLine.text);
    }

    function updateUIState(): void {
        $('.remove-input-line').toggleClass('disabled', inputLines.length < 2);
        localizeText(langPack);
    }

    function setFocus(id: number): void {
        $(`#barcode-input-${id}`).focus();
    }

    function initializeStorageService(): StorageService {

        let enableLocalStorage = (typeof (localStorage) !== 'undefined');
        let storageService = null as StorageService;
        if (enableLocalStorage == true) {
            storageService = {
                get: (key: string) => localStorage.getItem(key),
                put: (key: string, value: string) => localStorage.setItem(key, value)
            };
        }
        else {
            storageService = {
                get: (key: string) => $.cookie(key),
                put: (key: string, value: string) => $.cookie(key, value)
            };
        }
        return storageService;
    }

    function localizeText(langPack: any): void {
        $('.x-lang').each((i, elem) => {
            let text = $(elem).text();
            $(elem).text(langPack[text] || text).removeClass('.x-lang');
        });
    }

    // Global error handling.
    window.onerror = <any>function (message: string, url?: string, lineNumber?: number, columnNumber?: number, exception?: Error) {
        exception = exception || <any>{ message, stack: `${url || '- unknown souce file -'}(${lineNumber}:${columnNumber})` };
        alert(exception);
    };
}