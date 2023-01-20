// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300, 500)

let allPaintStyles: PaintStyle[], allTextStyles: TextStyle[], allGridStyles: GridStyle[], allEffectStyles: EffectStyle[];
const nodes: SceneNode[] = [];
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangles') {
    GetAllStyles();
    CreateTransfer();
  }

  if (msg.type === 'import-styles') {
    ImportStyles();
  }

  if (msg.quit) figma.closePlugin();

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
};


function GetAllStyles(){
  allPaintStyles = figma.getLocalPaintStyles();
  allTextStyles = figma.getLocalTextStyles();
  allGridStyles = figma.getLocalGridStyles();
  allEffectStyles = figma.getLocalEffectStyles();

  console.log(allPaintStyles, allTextStyles, allGridStyles, allEffectStyles)

}

function CreateTransfer(){

  allTextStyles.forEach((element, i) => {
    createTextStyleLayer(element, 50, i*50)
  });

  // allPaintStyles.forEach(element => {
  //   paintInfo.characters += JSON.stringify(element)
  // });
}

function createTextStyleLayer(element:TextStyle, x:number, y:number){
  (async () => {
    const text = figma.createText()
  
    text.x = x
    text.y = y
  
    // Load the font in the text node before setting the characters
    await figma.loadFontAsync(element.fontName)
    text.characters = element.name;
    text.fontSize = element.fontSize;
    text.textDecoration = element.textDecoration;
    text.fontName = element.fontName;
    text.letterSpacing = element.letterSpacing;
    text.lineHeight = element.lineHeight;
    text.paragraphIndent = element.paragraphIndent;
    text.paragraphSpacing = element.paragraphSpacing;
    text.textCase = element.textCase;


    figma.currentPage.appendChild(text);
    nodes.push(text);
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  })()
}

function ImportStyles(){
  let nodes = figma.currentPage.selection;
  nodes.forEach(element => {
    if (element.type == 'TEXT'){
      (async () => {
        await figma.loadFontAsync(element.fontName as FontName)
        const text = figma.createTextStyle();
        text.name = element.characters;
        text.fontSize = element.fontSize as number;
        text.textDecoration = element.textDecoration as TextDecoration;
        text.fontName = element.fontName as FontName;
        text.letterSpacing = element.letterSpacing as LetterSpacing;
        text.lineHeight = element.lineHeight as LineHeight;
        text.paragraphIndent = element.paragraphIndent as number;
        text.paragraphSpacing = element.paragraphSpacing as number;
        text.textCase = element.textCase as TextCase;
      })()
    }
  });
}