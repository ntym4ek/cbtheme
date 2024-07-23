// function to go through all the items with .c0py class and build tooltips and clipboard copy image + event
function buildCopy(options) {
  // Query all the elements on the DOM with class c0py
  const copyDivs = document.querySelectorAll(".c0py");
  const copyText = options.copy !== undefined ? options.copy : "Copy to clipboard";
  const failText = options.failed !== undefined ? options.failed : "Failed to copy";
  const copiedText = options.copied !== undefined ? options.copied : "Copied";
  // Start the whole deal only if there are elements with class "c0py" in the DOM
  if (copyDivs.length > 0) {
    // Loop through all of the found c0py elements
    for (var i = 0; i < copyDivs.length; ++i) {
      // create the div that will encompass the entire clipboard image + tooltip
      const createTooltipDiv = document.createElement("div");
      // add class tooltip
      createTooltipDiv.classList.add("ctooltip");
      // insert it right after the c0py element
      copyDivs[i].parentNode.insertBefore(createTooltipDiv, copyDivs[i].nextSibling);
      // save the tooltip div to a variable for later use
      const tooltipDiv = document.getElementsByClassName("ctooltip")[i];
      // Let's create the SVG icon
      // Default is black
      let iconStroke = "#aaa";
      // Default 1.5 seems clean
      let strokeWidth = 1.5;
      // Check if data attributes have been passed, like the stroke color (data-clipboard-icon-stroke) and stroke width (data-clipboard-icon-stroke-width)
      if (copyDivs[i].dataset.clipboardIconStroke) {
        iconStroke = copyDivs[i].dataset.clipboardIconStroke;
      }
      if (copyDivs[i].dataset.clipboardIconStrokeWidth) {
        strokeWidth = copyDivs[i].dataset.clipboardIconStrokeWidth;
      }
      // The icon itself - taken from https://tablericons.com/
      let clipboardImgSource = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>';
      // Because we will be creating the SVG from a string, we need a parent element
      let div = document.createElement("div");
      // Append it to the new div
      div.innerHTML = clipboardImgSource;
      // Add it as a child of the tooltip main div
      tooltipDiv.appendChild(div);
      // Now actually get the new SVG element as an HTML Node element
      let clipboardImg = div.firstElementChild;
      // Add it the c0py-icon class (needed later)
      clipboardImg.classList.add("c0py-icon");
      // Apply the stroke
      // clipboardImg.style.stroke = iconStroke;
      // Apply the stroke-width
      clipboardImg.style.strokeWidth = strokeWidth;
      // create a <span> that will hold the tooltip text "Copy to clipboard"
      const createTooltipText = document.createElement("span");
      // Add tooltiptext class to it for styling
      createTooltipText.classList.add("ctooltiptext");
      // Set the text to Copy to Clipboard
      createTooltipText.innerHTML = copyText;
      // Add it as a child of the tooltip div
      tooltipDiv.appendChild(createTooltipText);
      // Save the text value of the c0py element that will need saving to clipboard, for usre in the copyToClipboard function
      const text = copyDivs[i].innerHTML;
      //  Save the tooltip span element so it can be used in the copyToClipboard function (to change the text to Copied! after clicking)
      const element = document.getElementsByClassName("ctooltiptext")[i];
      // Set the onclick event listener on the clipboard icon
      document.getElementsByClassName("c0py-icon")[i].addEventListener("click", function() {copyToClipboard(text, this, element)}, false);

      // Now the actual copy to clipboard function
      function copyToClipboard (text, icon, element) {
        // use the new ClipboardEvent API
        if (window.clipboardData && window.clipboardData.setData) {
          // IE specific code path to prevent textarea being shown while dialog is visible.
          return clipboardData.setData("Text", text);
          // If the new one is not supported, try the old one with execCommand("copy")
        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
          var textarea = document.createElement("textarea");
          textarea.textContent = text;
          textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
          document.body.appendChild(textarea);
          textarea.select();
          try {
            return document.execCommand("copy");
          } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            element.innerHTML = failText;
            return false;
          } finally {
            document.body.removeChild(textarea);
            element.innerHTML = copiedText;
            icon.classList.add("c0pied");
            setTimeout(function () {
              element.innerHTML = copyText;
            }, 1000);
            setTimeout(function () {
              icon.classList.remove("c0pied");
            }, 100);
          }
        }
      }
    }
  }
}
// Run the function
// buildCopy();
