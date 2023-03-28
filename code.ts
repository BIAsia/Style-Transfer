// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300, 400)

let allPaintStyles: PaintStyle[], allTextStyles: TextStyle[], allGridStyles: GridStyle[], allEffectStyles: EffectStyle[];
const nodes: SceneNode[] = [];
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'export-styles') {
    GetAllStyles();
    CreateTransfer();
  }

  if (msg.type === 'import-styles') {
    GetAllStyles();
    ImportStyles(true, true, true);
  }

  if (msg.type === 'export-color') {
    allPaintStyles = figma.getLocalPaintStyles();
    allPaintStyles.forEach((element, i) => {
      createPaintStyleLayer(element, 1050, i*50)
    });
  }

  if (msg.type === 'import-color') {
    allPaintStyles = figma.getLocalPaintStyles();
    ImportStyles(false, false, true);
  }

  if (msg.type === 'export-text') {
    allTextStyles = figma.getLocalTextStyles();
    allTextStyles.forEach((element, i) => {
      createTextStyleLayer(element, 50, i*50)
    });
  }

  if (msg.type === 'import-text') {
    allTextStyles = figma.getLocalTextStyles();
    ImportStyles(true, false, false);
  }

  if (msg.type === 'export-effect') {
    allEffectStyles = figma.getLocalEffectStyles();
    allEffectStyles.forEach((element, i) => {
      createEffectStyleLayer(element, 350, i*50)
    });
  }

  if (msg.type === 'import-effect') {
    allEffectStyles = figma.getLocalEffectStyles();
    ImportStyles(false, true, false);
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
  allEffectStyles.forEach((element, i) => {
    createEffectStyleLayer(element, 350, i*50)
  });
  allPaintStyles.forEach((element, i) => {
    createPaintStyleLayer(element, 1050, i*50)
  });

  // allPaintStyles.forEach(element => {
  //   paintInfo.characters += JSON.stringify(element)
  // });
}

function createEffectStyleLayer(element:EffectStyle, x:number, y:number){
  const rect = figma.createFrame()
  rect.x = x
  rect.y = y

  rect.resize(200, 50);
  rect.effectStyleId = element.id;
  rect.name = element.name;

  figma.currentPage.appendChild(rect);
  nodes.push(rect);
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}

function createPaintStyleLayer(element:PaintStyle, x:number, y:number){
  const rect = figma.createRectangle()
  rect.x = x
  rect.y = y

  rect.resize(200, 50);
  rect.fills = element.paints;
  rect.fillStyleId = element.id;
  rect.name = element.name;

  figma.currentPage.appendChild(rect);
  nodes.push(rect);
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}


function createTextStyleLayer(element:TextStyle, x:number, y:number){
  (async () => {
    const text = figma.createText()
  
    text.x = x
    text.y = y
  
    // Load the font in the text node before setting the characters
    await figma.loadFontAsync(element.fontName)
    text.fontName = element.fontName;
    text.characters = element.name;
    text.fontSize = element.fontSize;
    text.textDecoration = element.textDecoration;
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

function ImportStyles(text:boolean, effect:boolean, color:boolean){
  let nodes = figma.currentPage.selection;
  nodes.forEach(element => {
    if (element.type == 'TEXT' && text){
      let text = allTextStyles.find(style => style.name === element.characters)
      if (!text) text = figma.createTextStyle();
      ImportTextStyle(element, text)
    }
    if (element.type == 'FRAME' && effect){
      let effect = allEffectStyles.find(style => style.name === element.name)
      if (!effect) effect = figma.createEffectStyle();
      ImportEffectStyle(element, effect)
    }
    if (element.type == 'RECTANGLE' && color){
      let paints = allPaintStyles.find(style => style.name === element.name)
      if (!paints) paints = figma.createPaintStyle();
      ImportPaintStyle(element, paints)
    }
  });
}

function ImportTextStyle(element:TextNode, text:TextStyle){
  (async () => {
    await figma.loadFontAsync(element.fontName as FontName)
    // const text = figma.createTextStyle();
    text.fontName = element.fontName as FontName;
    text.name = element.characters;
    text.fontSize = element.fontSize as number;
    text.textDecoration = element.textDecoration as TextDecoration;
    text.letterSpacing = element.letterSpacing as LetterSpacing;
    text.lineHeight = element.lineHeight as LineHeight;
    text.paragraphIndent = element.paragraphIndent as number;
    text.paragraphSpacing = element.paragraphSpacing as number;
    text.textCase = element.textCase as TextCase;
  })()
}

function ImportEffectStyle(element:FrameNode, effect:EffectStyle){
  const newEffect = element.effects;
  // const effect = figma.createEffectStyle();
  effect.name = element.name
  effect.effects = newEffect;
}

function ImportPaintStyle(element:RectangleNode, paints:PaintStyle){
  const newPaints = element.fills as ReadonlyArray<Paint>;
  // const paints = figma.createPaintStyle();
  paints.name = element.name;
  paints.paints = newPaints;
}

function ReplaceTextStyle(element:TextNode){

}


function CreateStyles(){
  let nodes = figma.currentPage.selection;
  nodes.forEach(element => {
    
  });
}