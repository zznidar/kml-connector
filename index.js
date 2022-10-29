var xmlDoc;
async function parse() {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(await inputpicker.files[0].text(), "text/xml");
    filename = await inputpicker.files[0].name;
    parseTemplate().then(() => generate());
}

var xml;
async function parseTemplate() {
    parser = new DOMParser();
    fetch("template.xml")    
    .then((response) => response.text())
    .then((text) => {
        console.log(text);
        xml = parser.parseFromString(text, "text/xml");
        console.log(xml);
        generate(xml);
    });
}

log = document.getElementById("log");

function generate() {
    console.warn(xml);
    
    ori = xml.getElementsByTagName("gx:Track")[0];

    /*
    <when>2021-08-28T00:17:42Z</when>
    <gx:coord>14.3127827 46.2750474 459</gx:coord>
    */

    console.log("Starting ...");
    log.innerText += "Starting ...\nIf there are no errors, conversion should finish shortly.\n";
    for(let p of xmlDoc.getElementsByTagName("Placemark")) {
        /*
        <Placemark>
            <TimeStamp><when>2022-09-08T00:02:49Z</when></TimeStamp>
                <ExtendedData>
                    <Data name="accuracy">
                    <value>69</value>
                    </Data>
                    <Data name="altitude">
                    <value>123</value>
                    </Data>
                </ExtendedData>
            <Point><coordinates>10.1234567,50.987654</coordinates></Point>
        </Placemark>
        */
        let w = xml.createElement("when");
        w.innerHTML = p.getElementsByTagName("TimeStamp")[0].getElementsByTagName("when")[0].innerHTML;

        altitude = p.getElementsByTagName("ExtendedData")[0]?.getElementsByTagName("Data")[1]?.getElementsByTagName("value")[0]?.innerHTML || 0;

        let c = xml.createElement("gx:coord");
        c.innerHTML = `${p.getElementsByTagName("Point")[0].getElementsByTagName("coordinates")[0].innerHTML.split(",").join(" ")} ${altitude}`;

        ori.appendChild(w);
        ori.appendChild(c);
    }
    console.log("Came through");
    log.innerText += "Finished. A converted file should appear in your Downloads.\n";



    // XML is ready; download it!
    download((`${(new Date()).getTime()}.kml`), new XMLSerializer().serializeToString(xml.documentElement));
    
}

// https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/xml;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

  
inputpicker.onchange = async function(e) {
    console.log("Changed.", e);

    // Feature detection
    if(!inputpicker.files[0].text) {
        // Browser does not support getting text from the file. 
        // Probably it also doesn't support Optional Chaining (?.)
        // Adding support for older workarounds would make our code messy. Show user a message.
        alert("Your browser does not support the newest technologies needed for this website. Sorry about that.\nTry using a different and updated browser.");
    }
    
    await parse();
}