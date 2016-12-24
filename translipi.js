LIPI_DEFAULT = "latn";
LIPI_COOKIE = "lipiChosen";
LIPI_EXPIRY = 30 * 24 * 3600 * 1000;  // 30 days

var chosenLipi = LIPI_DEFAULT;

/* ---- Public API ---- */
var translipi = {
    "loadChosenLipi": loadLipi,
    "saveChosenLipi": saveLipi,
    "manageEvent": manageEvent,
    "main": main,
    "Message": function(theType, theData) {
        this.type = theType;
        this.data = theData;
    },
    "receiveMsgFromWidget": receiveMsgFromWidget,
    "pingTranslipiWidget": pingTranslipiWidget
}

/* ---- Cookies ---- */
function loadLipi() {
    var lipiEq = LIPI_COOKIE + "=";
    var offset = document.cookie.indexOf(lipiEq);
    if (offset != -1) {
        chosenLipi = document.cookie.substr(offset + lipiEq.length, 2);
    } else {
        chosenLipi = LIPI_DEFAULT;
    }
    return chosenLipi;
}

function saveLipi(lipi) {
    chosenLipi = lipi || LIPI_DEFAULT;
    var date = new Date();
    date.setTime(date.getTime() + LIPI_EXPIRY);
    var addendum = "; expires=" + date.toGMTString() + "; path=/";
    document.cookie = LIPI_COOKIE + "=" + chosenLipi + addendum;
}

/* ---- PostMessage ---- */
function manageEvent(eventObj, event, eventHandler) {
   if (eventObj.addEventListener) {
      eventObj.addEventListener(event, eventHandler,false);
   } else if (eventObj.attachEvent) {
      event = "on" + event;
      eventObj.attachEvent(event, eventHandler);
   }
}

/* ---- DOM ---- */
function traverseTree(node, cond, proc) {
   if (cond(node)) {
       proc(node);
   } else {
       var children = node.childNodes;
       for (var i = 0; i < children.length; i++) {
           traverseTree(children[i], cond, proc);
       }
   }
}

/*---- Transliteration ---- */
var lipiSubtrees = [];
var lipiElementsSaved = false;

var devanagari = {
    "O$": "ो", "ch": "छ", "zh": "ऴ", "jh": "झ", "ai": "ऐ", "||": "॥",
    "j": "ज", "lRR$": "ॣ", "'": "ऽ", "lRR": "ॡ", "lR": "ऌ", "Th": "ठ",
    "U$": "ू", "A$": "ा", "gh": "घ", "Z": "ज़", "bh": "भ", "dh": "ध",
    "RR": "ॠ", "E$": "े", "o$": "ॊ", "th": "थ", "e$": "ॆ", "u$": "ु",
    "ph": "फ", "I$": "ी", "A": "आ", "RR$": "ॄ", "E": "ए", "D": "ड",
    "G": "ङ", "rR": "ऱ", "I": "ई", "H": "ः", "J": "ञ", "M": "ं",
    "L": "ळ", "O": "ओ", "N": "ण", "R$": "ृ", "S": "ष", "R": "ऋ",
    "U": "ऊ", "T": "ट", "ai$": "ै", "V$": "्", "w": "व", "lR$": "ॢ",
    "i$": "ि", "au$": "ौ", "d": "द", "a": "अ", "c": "च", "b": "ब",
    "e": "ऎ", "Dh": "ढ", "g": "ग", "f": "फ़", "i": "इ", "h": "ह",
    "k": "क", "kh": "ख", "m": "म", "l": "ल", "o": "ऒ", "n": "न",
    "p": "प", "s": "स", "r": "र", "u": "उ", "t": "त", "nN": "न",
    "v": "व", "y": "य", "au": "औ", "z": "श", "|": "।"
};

var grantha = {
    "O$": "𑍋", "ch": "𑌛", "jh": "𑌝", "ai": "𑌐", "||": "॥",
    "j": "𑌜", "lRR$": "𑍣", "'": "𑌽", "lRR": "𑍡", "lR": "𑌌", "Th": "𑌠",
    "U$": "𑍂", "A$": "𑌾", "gh": "𑌘", "bh": "𑌭", "dh": "𑌧",
    "RR": "", "E$": "𑍇", "th": "𑌥", "u$": "𑍁",
    "ph": "𑌫", "I$": "𑍀", "A": "𑌆", "RR$": "𑍄", "E": "𑌏", "D": "𑌡",
    "G": "𑌙", "I": "𑌈", "H": "𑌃", "J": "𑌞", "M": "𑌂",
    "L": "𑌳", "O": "𑌓", "N": "𑌣", "R$": "𑍃", "S": "𑌷", "R": "𑌋",
    "U": "𑌊", "T": "𑌟", "ai$": "𑍈", "V$": "", "w": "𑌵", "lR$": "𑍢",
    "i$": "𑌿", "au$": "𑍌", "d": "𑌦", "a": "𑌅", "c": "𑌚", "b": "𑌬",
    "Dh": "𑌢", "g": "𑌗", "i": "𑌇", "h": "𑌹",
    "k": "𑌕", "kh": "𑌖", "m": "𑌮", "l": "𑌲", "n": "𑌨",
    "p": "𑌪", "s": "𑌸", "r": "𑌰", "u": "𑌉", "t": "𑌤",
    "v": "𑌵", "y": "𑌯", "au": "𑌔", "z": "𑌶", "|": "।"
};

var telugu = {
    "O$": "ో", "ch": "ఛ", "zh": "ళ", "jh": "ఝ", "ai": "ఐ", "j": "జ",
    "lRR": "ౡ", "lR": "ఌ", "Th": "ఠ", "U$": "ూ", "A$": "ా", "gh": "ఘ",
    "Z": "జ", "bh": "భ", "dh": "ధ", "RR": "ౠ", "E$": "ే", "o$": "ొ",
    "th": "థ", "e$": "ె", "u$": "ు", "ph": "ఫ", "I$": "ీ", "A": "ఆ",
    "RR$": "ౄ", "E": "ఏ", "D": "డ", "G": "ఙ", "rR": "ఱ", "I": "ఈ",
    "H": "ః", "J": "ఞ", "M": "ం", "L": "ళ", "O": "ఓ", "N": "ణ",
    "R$": "ృ", "S": "ష", "R": "ఋ", "U": "ఊ", "T": "ట", "ai$": "ై",
    "V$": "్", "w": "వ", "lR$": "ౢ", "i$": "ి", "au$": "ౌ", "d": "ద",
    "a": "అ", "c": "చ", "b": "బ", "e": "ఎ", "Dh": "ఢ", "g": "గ",
    "f": "ఫ", "i": "ఇ", "h": "హ", "k": "క", "kh": "ఖ", "m": "మ",
    "l": "ల", "o": "ఒ", "n": "న", "p": "ప", "s": "స", "r": "ర",
    "u": "ఉ", "t": "త", "nN": "న", "v": "వ", "y": "య", "au": "ఔ",
    "z": "శ", "'": "ఽ"
};

var kannada = {
    "O$": "ೋ", "ch": "ಛ", "zh": "ಳ", "jh": "ಝ", "ai": "ಐ", "j": "ಜ",
    "lRR$": "ೄ", "lRR": "ೡ", "lR": "ಌ", "Th": "ಠ", "U$": "ೂ", "A$": "ಾ",
    "gh": "ಘ", "Z": "ಜ", "bh": "ಭ", "dh": "ಧ", "RR": "ೠ", "E$": "ೇ",
    "o$": "ೊ", "th": "ಥ", "e$": "ೆ", "u$": "ು", "ph": "ಫ", "I$": "ೀ",
    "A": "ಆ", "RR$": "ೄ", "E": "ಏ", "D": "ಡ", "G": "ಙ", "rR": "ಱ",
    "I": "ಈ", "H": "ಃ", "J": "ಞ", "M": "ಂ", "L": "ಳ", "O": "ಓ",
    "N": "ಣ", "R$": "ೃ", "S": "ಷ", "R": "ಋ", "U": "ಊ", "T": "ಟ",
    "ai$": "ೈ", "V$": "್", "w": "ವ", "lR$": "ೄ", "i$": "ಿ", "au$": "ೌ",
    "d": "ದ", "a": "ಅ", "c": "ಚ", "b": "ಬ", "e": "ಎ", "Dh": "ಢ",
    "g": "ಗ", "f": "ೞ", "i": "ಇ", "h": "ಹ", "k": "ಕ", "kh": "ಖ",
    "m": "ಮ", "l": "ಲ", "o": "ಒ", "n": "ನ", "p": "ಪ", "s": "ಸ",
    "r": "ರ", "u": "ಉ", "t": "ತ", "nN": "ನ", "v": "ವ", "y": "ಯ",
    "au": "ಔ", "z": "ಶ", "'": "ಽ"
};

var roman = {
    "a": "a", "A": "ā",
    "i": "i", "I": "ī",
    "u": "u", "U": "ū",
    "R": "ṛ", "RR": "ṝ",
    "lR": "ḷ", "lRR": "ḹ",
    "e": "e", "E": "ē", "ai": "ai",
    "o": "o", "O": "ō", "au": "au",
    "M": "ṃ", "H": "ḥ",
    "k": "k", "kh": "kh", "g": "g", "gh": "gh", "G": "ṅ",
    "c": "c", "ch": "ch", "j": "j", "jh": "jh", "J": "ñ",
    "T": "ṭ", "Th": "ṭh", "D": "ḍ", "Dh": "ḍh", "N": "ṇ",
    "t": "t", "th": "th", "d": "d", "dh": "dh", "n": "n", "nN": "n",
    "p": "p", "ph": "ph", "b": "b", "bh": "bh", "m": "m",
    "y": "y", "r": "r", "rR": "ṟ", "l": "l",
    "L": "ḷ", "zh": "zh",
    "v": "v", "w": "w", "'": "’",
    "z": "ś", "S": "ṣ", "s": "s", "h": "h",
    "A$": "ā", "i$": "i", "I$": "ī",
    "u$": "u", "U$": "ū",
    "R$": "ṛ", "RR$": "ṝ",
    "lR$": "ḷ", "lRR$" : "ḹ",
    "e$": "e", "E$": "ē", "ai$": "ai",
    "o$": "o", "O$": "ō", "au$": "au",
    "V$": "", "f": "f", "Z": "z"
};

malayalam = {
    "O$": "", "ch": "ഛ", "zh": "ഴ", "jh": "ഝ", "ai": "ഐ", "j": "ജ", "lRR$": "ൄ",
    "'": "ഽ", "lRR": "ൡ", "lR": "ഌ", "Th": "ഠ", "U$": "ൂ", "A$": "ാ", "gh": "ഘ",
    "Z": "ജ", "bh": "ഭ", "dh": "ധ", "RR": "ൠ", "E$": "േ", "o$": "ൊ", "th": "ഥ",
    "e$": "െ", "u$": "ു", "ph": "ഫ", "I$": "ീ", "A": "ആ", "RR$": "ൃ", "E": "ഏ",
    "D": "ഡ", "G": "ങ", "rR": "റ", "I": "ഈ", "H": "ഃ", "J": "ഞ", "M": "ം",
    "L": "ള", "O": "ഓ", "N": "ണ", "R$": "ൃ", "S": "ഷ", "R": "ഋ", "U": "ഊ",
    "T": "ട", "ai$": "ൈ", "V$": "്", "w": "വ", "lR$": "ൃ", "i$": "ി", "au$": "ൌ",
    "d": "ദ", "a": "അ", "c": "ച", "b": "ബ", "e": "എ", "Dh": "ഢ", "g": "ഗ",
    "f": "ഫ", "i": "ഇ", "h": "ഹ", "k": "ക", "kh": "ഖ", "m": "മ", "l": "ല",
    "o": "ഒ", "n": "ന", "p": "പ", "s": "സ", "r": "ര", "u": "ഉ", "t": "ത",
    "nN": "ന", "v": "വ", "y": "യ", "au": "ഔ", "z": "ശ"
};

var tamil = {
    "O$": "ோ", "ch": "ச", "zh": "ழ", "jh": "ஜ", "ai": "ஐ", "j": "ஜ",
    "lRR": "லூ", "lR": "லு", "Th": "ட", "U$": "ூ", "A$": "ா", "gh": "க",
    "Z": "ஃஜ", "bh": "ப", "dh": "த", "RR": "ரூ", "E$": "ே", "o$": "ொ",
    "th": "த", "e$": "ெ", "u$": "ு", "ph": "ப", "I$": "ீ", "A": "ஆ",
    "RR$": "்ரூ", "E": "ஏ", "D": "ட", "G": "ங", "rR": "ற", "I": "ஈ",
    "H": ":", "J": "ஞ", "M": "ம்", "L": "ள", "O": "ஓ", "N": "ண",
    "R$": "்ரு", "S": "ஷ", "R": "ரு", "U": "ஊ", "T": "ட", "ai$": "ை",
    "V$": "்", "w": "வ", "lR$": "்", "i$": "ி", "au$": "ௌ", "d": "த",
    "a": "அ", "c": "ச", "b": "ப", "e": "எ", "Dh": "ட", "g": "க",
    "f": "ஃப", "i": "இ", "h": "ஹ", "k": "க", "kh": "க", "m": "ம",
    "l": "ல", "o": "ஒ", "n": "ந", "p": "ப", "s": "ஸ", "r": "ர",
    "u": "உ", "t": "த", "nN": "ன", "v": "வ", "y": "ய", "au": "ஔ",
    "z": "ஶ", "'": "’"
};


var scripts = {
    "deva" : devanagari,
    "gran" : grantha,
    "latn" : roman,
    "knda" : kannada,
    "mlym" : malayalam,
    "taml" : tamil,
    "telu" : telugu
};

function isConsonant(str) {
    var consonants = [
        "k","kh","g","gh","G",
        "c","ch","j","jh","J",
        "T","Th","D","Dh","N","nN",
        "t","th","d","dh","n",
        "p","ph","b","bh","m",
        "y","r","rR","l","L","zh","v","w",
        "z","S","s","h","f","Z"];
    if(str=="") return false;
    for(var i=0; i < consonants.length; i++) {
        if(str == consonants[i])
            return true;
    }
    return false;
}

function isVowel(str) {
    var vowels = [
        "a","A","i","I","u","U",
        "R","RR","lR","lRR",
        "e","E","ai","o","O","au"];
    if(str=="") return false;
    for(var i=0; i < vowels.length; i++) {
        if(vowels[i] == str)
            return true;
    }
    return false;
}

function nasalToAnuswara(input) {
    var reNasals = /(\BG(?=[^GJNnmaAiIuUReEoO]\B))|(\BJ(?=[^GJNnmaAiIuUReEoO]\B))|(\BN(?=[^GJNnmaAiIuUReEoO]\B))|(\Bn(?=[^nmNyraAiIuUReEoO]\B))|\Bm(?=[^nmyraAiIuUReEoO])|\Bm\b/gm
    return input.replace(reNasals, "M");
}
var preproc = {
    "taml": function (input) {
        var reAlveolarN = /\Bn(?=[^tdN])/gm
        input = input.replace(reAlveolarN, "nN");
        var reAlveolarN2 = /\Bn(?=nN)/gm
        input = input.replace(reAlveolarN2, "nN");
        var reAlveolarN = /\Bn$/gm
        input = input.replace(reAlveolarN, "nN");
        var reNasalG = /\BM(?=[kg])/gm
        input = input.replace(reNasalG, "G");
        var reNasalJ = /\BM(?=[cj])/gm
        input = input.replace(reNasalJ, "J");
        var reNasaln = /\BM(?=[td])/gm
        input = input.replace(reNasaln, "n");
        return input;
    },
    "telu": nasalToAnuswara,
    "knda": nasalToAnuswara,
    "mlym": function (input) {
        var endM = /\Bm\b/gm
        return input.replace(endM, "M");
    }
}

function transliterate(input) {
    var i=0, j;
    var output="", current="", previous="";
    var tab = scripts[chosenLipi];

    if (preproc[chosenLipi] != undefined) {
        input = preproc[chosenLipi](input);
    }

    do {
        current = "";

        //1. Parse and tokenise: Find the biggest substring found in the hash table
        for(j = Math.min(input.length-i, 3); j > 0; j--) {
            var substr = input.substr(i,j);
            if(tab[substr] != undefined) {
                if ((substr == "'") && (!previous || "oOeE'".indexOf(previous) == -1)) {
                    break;
                }
                current = substr;
                break;
            }
        }
        if (current == "") j = 1;

        //2. Match with syntax and take appropriate action
        if (chosenLipi == "en") {
            if (current) output += tab[current];
            else output += input.substr(i,j);
        }
        else {
            if (isConsonant(previous) && isVowel(current)) { //CV
                if (current != "a") output += tab[current+"$"]; //Abugida
            }
            else if (isConsonant(previous)) { //CC or C*
                output += tab["V$"];
                if (current != "") output += tab[current];
                else output += input.substr(i,j);
            }
            else if (current != "")
                output+= tab[current];
            else
                output += input.substr(i,j);
        }
        previous = current; i+=j;
    }
    while(i < input.length);

    if(chosenLipi != "en" && isConsonant(previous))
        output += tab["V$"];

    return output;
}

function initLipis(node) {
    if (!lipiElementsSaved) lipiSubtrees.push(node);
        // Traverse lipi subtree and save original content
    traverseTree(node, function (n) {
            return (n.nodeType == 3 && !n.hasChildNodes());
        }, function(n) {
            if (!lipiElementsSaved)  n.tlOrig = n.nodeValue;
            n.nodeValue = transliterate(n.tlOrig);
        });
}

function main(lipi) {
    if (lipi) chosenLipi = lipi;
    traverseTree(document.body, function (n) {
            return (n.nodeType == 1 && n.getAttribute("lipi"));
        },
        initLipis);
    lipiElementsSaved = true;
}

/* ---- Blog-side code ---- */
function getTranslipiWidget() {
    iframes = document.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].src.indexOf("translipi") != -1) {
            return iframes[i].contentWindow;
        }
    }
}

function pingTranslipiWidget() {
    try {
        getTranslipiWidget().postMessage(new translipi.Message("ScriptChoiceRequest", ""), '*');
    } catch (e) {
        translipi.main("en");
        console.log(e);
    }
};

function receiveMsgFromWidget(e) {
    msg = e.data;
    switch (msg.type) {
        case "ScriptChoiceResponse":
        case "ScriptChangeRequest":
            translipi.main(msg.data);
            break;
    }
}
