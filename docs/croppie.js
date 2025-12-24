/**
 * Create an HTML element and apply optional class, attributes, and inline styles.
 * @param {string} tagName - The tag name for the element to create (e.g., "div", "img").
 * @param {{className?: string, attributes?: Record<string,string>, styles?: Partial<CSSStyleDeclaration>}} [options] - Optional element configuration.
 * @param {string} [options.className] - Class name to assign to the element.
 * @param {Record<string,string>} [options.attributes] - Attributes to set on the element (key -> value).
 * @param {Partial<CSSStyleDeclaration>} [options.styles] - Inline styles to apply to the element.
 * @returns {HTMLElement} The newly created element with the applied configuration.
 */
function R(V,G){let J=document.createElement(V);if(G?.className)J.className=G.className;if(G?.attributes)for(let[K,N]of Object.entries(G.attributes))J.setAttribute(K,N);if(G?.styles)Object.assign(J.style,G.styles);return J}/**
 * Apply a 2D transform to an element: translate by (x, y) pixels and scale uniformly.
 * @param {HTMLElement} V - The element to transform.
 * @param {number} G - X translation in pixels.
 * @param {number} J - Y translation in pixels.
 * @param {number} K - Uniform scale factor.
 */
function P(V,G,J,K){V.style.transform=`translate(${G}px, ${J}px) scale(${K})`}/**
 * Create a container div for the croppie UI, optionally adding an extra class.
 * @param {string} V - Optional additional class name to append to the container.
 * @returns {HTMLDivElement} The created div element with class "croppie-container" and the extra class if provided.
 */
function U(V){return R("div",{className:`croppie-container${V?` ${V}`:""}`})}/**
 * Create the boundary element sized to the given dimensions for the crop container.
 * @param {{width: number, height: number}} V - Dimensions in pixels for the boundary.
 * @return {HTMLDivElement} The div element with class "cr-boundary" and inline styles for width, height, relative positioning, and hidden overflow.
 */
function j(V){return R("div",{className:"cr-boundary",styles:{width:`${V.width}px`,height:`${V.height}px`,position:"relative",overflow:"hidden"}})}/**
 * Creates a viewport container positioned and sized for the crop area.
 * @param {Object} V - Viewport options.
 * @param {'circle'|'square'} V.type - Shape of the viewport; when 'circle', a circular border-radius is applied.
 * @param {number} V.width - Width in pixels.
 * @param {number} V.height - Height in pixels.
 * @returns {HTMLDivElement} The viewport div element sized, centered, with pointer-events disabled and border-radius set for circular viewports.
 */
function T(V){return R("div",{className:`cr-viewport cr-vp-${V.type}`,styles:{width:`${V.width}px`,height:`${V.height}px`,position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",pointerEvents:"none",borderRadius:V.type==="circle"?"50%":"0"}})}/**
 * Create an overlay div that covers its container and applies a mask for the viewport.
 * @param {Object} V - Data used to compute the mask (provides viewport center/position used by the mask generator).
 * @param {Object} G - Viewport options used by the mask generator (e.g., `type`, `width`, `height`).
 * @returns {HTMLElement} The overlay `.cr-overlay` element with a semi-transparent background and the computed mask applied (including webkit mask).
 */
function X(V,G){let J=R("div",{className:"cr-overlay",styles:{position:"absolute",top:"0",left:"0",width:"100%",height:"100%",pointerEvents:"none"}}),K=g(V,G);return J.style.background="rgba(0, 0, 0, 0.5)",J.style.maskImage=K,J.style.webkitMaskImage=K,J}/**
   * Generate a CSS mask image string (gradients) for the given boundary and viewport.
   *
   * @param {{width: number, height: number}} V - Boundary dimensions used as the gradient reference (centered at V.width/2, V.height/2).
   * @param {{type: string, width: number, height: number}} G - Viewport description; when `type` is `"circle"` the `width` is treated as diameter.
   * @returns {string} A CSS image string: a `radial-gradient` for circular viewports or two `linear-gradient`s for rectangular viewports that together form the mask.
   */
  function g(V,G){let J=V.width/2,K=V.height/2;if(G.type==="circle"){let A=G.width/2;return`radial-gradient(circle ${A}px at ${J}px ${K}px, transparent ${A}px, black ${A}px)`}let N=J-G.width/2,Q=J+G.width/2,$=K-G.height/2,B=K+G.height/2;return`
    linear-gradient(to right, black ${N}px, transparent ${N}px, transparent ${Q}px, black ${Q}px),
    linear-gradient(to bottom, black ${$}px, transparent ${$}px, transparent ${B}px, black ${B}px)
  `}/**
 * Create an <img> element preconfigured for use as the crop preview image.
 *
 * The image has class "cr-image", alt text "Cropper image", is not draggable,
 * and has inline styles to position it absolutely with transform-origin at the top-left
 * and no max size constraints.
 * @returns {HTMLImageElement} The configured image element.
 */
function Y(){return R("img",{className:"cr-image",attributes:{alt:"Cropper image",draggable:"false"},styles:{position:"absolute",top:"0",left:"0",transformOrigin:"0 0",maxWidth:"none",maxHeight:"none"}})}/**
 * Create a range input slider element configured with specified bounds and initial value.
 * @param {number|string} V - Minimum slider value.
 * @param {number|string} G - Maximum slider value.
 * @param {number|string} J - Initial slider value.
 * @returns {HTMLInputElement} The created input[type="range"] element with step set to 0.01.
 */
function D(V,G,J){return R("input",{className:"cr-slider",attributes:{type:"range",min:String(V),max:String(G),step:"0.01",value:String(J)}})}/**
 * Create a wrapper element for the zoom slider.
 * @returns {HTMLDivElement} A div element with the class "cr-slider-wrap".
 */
function E(){return R("div",{className:"cr-slider-wrap"})}/**
 * Create a canvas of the specified size, optionally fill/clip it, and draw the specified crop region of an image onto it.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap} V - Source image to draw from.
 * @param {{topLeftX:number, topLeftY:number, bottomRightX:number, bottomRightY:number}} G - Crop bounds in source-image coordinates.
 * @param {number} J - Output canvas width in pixels.
 * @param {number} K - Output canvas height in pixels.
 * @param {{backgroundColor?:string, circle?:boolean}} [N] - Optional rendering options. If `backgroundColor` is provided, the canvas is filled with that color before drawing. If `circle` is true, the drawing is clipped to a centered circle.
 * @returns {HTMLCanvasElement} The resulting canvas with the drawn crop.
 * @throws {Error} If a 2D rendering context cannot be obtained.
 */
function k(V,G,J,K,N){let Q=document.createElement("canvas");Q.width=J,Q.height=K;let $=Q.getContext("2d");if(!$)throw Error("Failed to get 2D context");if(N?.backgroundColor)$.fillStyle=N.backgroundColor,$.fillRect(0,0,J,K);if(N?.circle)$.beginPath(),$.arc(J/2,K/2,J/2,0,Math.PI*2),$.closePath(),$.clip();let B=G.bottomRightX-G.topLeftX,A=G.bottomRightY-G.topLeftY;return $.drawImage(V,G.topLeftX,G.topLeftY,B,A,0,0,J,K),Q}/**
 * Convert a canvas to an image Blob using the given format and quality.
 *
 * @param {HTMLCanvasElement} V - The source canvas to convert.
 * @param {string} [G="png"] - Image MIME subtype (e.g., "png", "jpeg"); used to build the MIME type `image/{G}`.
 * @param {number} [J=0.92] - Image quality between 0 and 1 (used for formats that support quality, e.g., "jpeg" or "webp").
 * @returns {Promise<Blob>} A Blob containing the canvas image in the specified format.
 * The promise rejects with an Error if the Blob could not be created.
 */
function z(V,G="png",J=0.92){return new Promise((K,N)=>{let Q=`image/${G}`;V.toBlob(($)=>{if($)K($);else N(Error("Failed to create blob from canvas"))},Q,J)})}/**
 * Convert a canvas to a data URL using the given image format and quality.
 * @param {HTMLCanvasElement} V - Source canvas to serialize.
 * @param {string} [G="png"] - Image format extension (e.g. "png", "jpeg", "webp"); used as the mime subtype.
 * @param {number} [J=0.92] - Image quality between 0 and 1 (applies to formats that support quality, e.g. "jpeg" and "webp").
 * @returns {string} A data URL containing the canvas image encoded with the specified format and quality.
 */
function C(V,G="png",J=0.92){let K=`image/${G}`;return V.toDataURL(K,J)}/**
 * Enables pointer dragging on an element to update a two-dimensional transform and notify lifecycle callbacks.
 * @param {HTMLElement} V - Element that will receive pointer events and visual cursor changes.
 * @param {function(): {x: number, y: number}} G - Function that returns the element's current transform as an object with `x` and `y`.
 * @param {function(number, number): void} J - Function that applies a new transform; called with `x` and `y`.
 * @param {{onStart?: function(Object), onMove?: function(Object), onEnd?: function(Object)}=} K - Optional callbacks invoked with the current transform on drag start, move, and end.
 * @returns {function(): void} A cleanup function that removes the pointer event listeners added to the element.
 */
function f(V,G,J,K){let N={isDragging:!1,startX:0,startY:0,startTransformX:0,startTransformY:0},Q=(A)=>{if(A.button!==0)return;N.isDragging=!0,N.startX=A.clientX,N.startY=A.clientY;let _=G();N.startTransformX=_.x,N.startTransformY=_.y,V.setPointerCapture(A.pointerId),V.style.cursor="grabbing",K?.onStart?.(_)},$=(A)=>{if(!N.isDragging)return;let _=A.clientX-N.startX,I=A.clientY-N.startY,F=N.startTransformX+_,S=N.startTransformY+I;J(F,S);let M=G();K?.onMove?.(M)},B=(A)=>{if(!N.isDragging)return;N.isDragging=!1,V.releasePointerCapture(A.pointerId),V.style.cursor="grab";let _=G();K?.onEnd?.(_)};return V.addEventListener("pointerdown",Q),V.addEventListener("pointermove",$),V.addEventListener("pointerup",B),V.addEventListener("pointercancel",B),V.style.cursor="grab",V.style.touchAction="none",()=>{V.removeEventListener("pointerdown",Q),V.removeEventListener("pointermove",$),V.removeEventListener("pointerup",B),V.removeEventListener("pointercancel",B)}}/**
 * Clamp a number to an inclusive range.
 * @param {number} V - The value to clamp.
 * @param {number} G - The minimum allowed value.
 * @param {number} J - The maximum allowed value.
 * @returns {number} The value constrained to be between `G` and `J` (inclusive).
 */
function q(V,G,J){return Math.min(Math.max(V,G),J)}/**
 * Attach wheel-based zoom handling to a DOM element.
 *
 * Prevents the default wheel scrolling and adjusts zoom using the provided getters/setters. If `requireCtrl` is true, wheel events are ignored unless the Control key is pressed. Calls `options.onChange` with the new and previous zoom when the zoom changes.
 *
 * @param {HTMLElement} element - Element to receive wheel events.
 * @param {() => number} getZoom - Function that returns the current zoom value.
 * @param {(zoom: number) => void} setZoom - Function to apply a new zoom value (should accept a clamped value).
 * @param {{min: number, max: number}} bounds - Zoom bounds with `min` and `max`.
 * @param {{onChange?: (newZoom: number, previousZoom: number) => void}=} options - Optional callbacks; `onChange` is invoked when zoom changes.
 * @param {boolean} [requireCtrl=false] - If true, ignore wheel events unless `ctrlKey` is pressed.
 * @returns {() => void} A cleanup function that removes the wheel listener.
 */
function Z(V,G,J,K,N,Q=!1){let $=(B)=>{if(Q&&!B.ctrlKey)return;B.preventDefault();let A=G(),_=B.deltaY>0?-0.1:0.1,I=q(A+_,K.min,K.max);if(I!==A)J(I),N?.onChange?.(I,A)};return V.addEventListener("wheel",$,{passive:!1}),()=>{V.removeEventListener("wheel",$)}}/**
 * Attaches two-finger pinch-to-zoom handlers to an element and returns a cleanup function.
 *
 * Sets up touchstart/move/end listeners that measure distance between two touches to compute a pinch scale,
 * applies that scale to the current zoom (via the provided getter and setter), and invokes an optional onChange callback
 * with (newZoom, previousZoom) when the zoom value actually changes.
 *
 * @param {HTMLElement} V - The element to attach touch listeners to.
 * @param {() => number} G - Function that returns the current zoom value.
 * @param {(zoom: number) => void} J - Function to apply a new zoom value.
 * @param {{min: number, max: number}} K - Zoom bounds used to clamp the computed zoom.
 * @param {{onChange?: (newZoom: number, prevZoom: number) => void}} [N] - Optional hooks; supports `onChange`.
 * @returns {() => void} A function that removes the attached touch event listeners.
 */
function w(V,G,J,K,N){let Q=0,$=1,B=(F)=>{if(F.length<2)return 0;let S=F.item(0),M=F.item(1);if(!S||!M)return 0;let x=S.clientX-M.clientX,O=S.clientY-M.clientY;return Math.sqrt(x*x+O*O)},A=(F)=>{if(F.touches.length===2)F.preventDefault(),Q=B(F.touches),$=G()},_=(F)=>{if(F.touches.length===2&&Q>0){F.preventDefault();let M=B(F.touches)/Q,x=G(),O=q($*M,K.min,K.max);if(O!==x)J(O),N?.onChange?.(O,x)}},I=()=>{Q=0};return V.addEventListener("touchstart",A,{passive:!1}),V.addEventListener("touchmove",_,{passive:!1}),V.addEventListener("touchend",I),()=>{V.removeEventListener("touchstart",A),V.removeEventListener("touchmove",_),V.removeEventListener("touchend",I)}}/**
 * Load an image from a data URL or remote URL and resolve with the created HTMLImageElement.
 *
 * Uses anonymous CORS for non-data URLs to allow cross-origin use (e.g., drawing to a canvas).
 * @param {string} V - The image source URL or data URL.
 * @returns {Promise<HTMLImageElement>} Resolves with the loaded Image element, rejects with an Error if loading fails.
 */
function y(V){return new Promise((G,J)=>{let K=new Image;if(!V.startsWith("data:"))K.crossOrigin="anonymous";K.onload=()=>G(K),K.onerror=()=>J(Error(`Failed to load image: ${V}`)),K.src=V})}/**
 * Read a File or Blob and convert it to a data URL.
 * @param {File|Blob} file - The file or blob to read.
 * @returns {Promise<string>} A promise that resolves with the file encoded as a data URL, or rejects with an Error if reading fails.
 */
function H(V){return new Promise((G,J)=>{let K=new FileReader;K.onload=()=>{if(typeof K.result==="string")G(K.result);else J(Error("Failed to read file as data URL"))},K.onerror=()=>J(Error("Failed to read file")),K.readAsDataURL(V)})}/**
 * Compute the minimal uniform scale required for a source rectangle to fully cover a target rectangle.
 * @param {number} V - Source width.
 * @param {number} G - Source height.
 * @param {number} J - Target width.
 * @param {number} K - Target height.
 * @returns {number} The scale factor equal to the larger of (J / V) and (K / G).
 */
function L(V,G,J,K){let N=J/V,Q=K/G;return Math.max(N,Q)}/**
 * Normalize a 4-element points array into an object with explicit corner properties.
 * @param {number[]|{topLeftX:number,topLeftY:number,bottomRightX:number,bottomRightY:number}|undefined} V - Either an array [topLeftX, topLeftY, bottomRightX, bottomRightY], an equivalent object, or undefined.
 * @returns {{topLeftX:number,topLeftY:number,bottomRightX:number,bottomRightY:number}|undefined} The points object when input was an array or object, or `undefined` if no input was provided.
 * @throws {Error} If an array is provided but does not contain exactly 4 elements.
 */
function W(V){if(V===void 0)return;if(Array.isArray(V)){if(V.length!==4)throw Error("PointsArray must have exactly 4 elements: [topLeftX, topLeftY, bottomRightX, bottomRightY]");return{topLeftX:V[0],topLeftY:V[1],bottomRightX:V[2],bottomRightY:V[3]}}return V}var v={min:0.1,max:10};class b{element;options;container=null;boundaryEl=null;viewportEl=null;overlayEl=null;previewEl=null;sliderEl=null;image=null;transform={x:0,y:0,scale:1};zoomConfig;effectiveMinZoom=0.1;eventHandlers=new Map;cleanupFns=[];constructor(V,G){this.element=V;let J={width:G.viewport.width+100,height:G.viewport.height+100};if(this.options={...G,boundary:G.boundary??J,showZoomer:G.showZoomer??!0,mouseWheelZoom:G.mouseWheelZoom??!0},this.zoomConfig={...v,...G.zoom},G.enableOrientation!==void 0)console.warn("[@bayinformatics/croppie] enableOrientation is deprecated and has no effect. Rotation support is planned for a future release.");this.createElements(),this.attachEventHandlers()}createElements(){if(this.container=U(this.options.customClass),this.boundaryEl=j(this.options.boundary),this.viewportEl=T(this.options.viewport),this.overlayEl=X(this.options.boundary,this.options.viewport),this.previewEl=Y(),this.boundaryEl.appendChild(this.previewEl),this.boundaryEl.appendChild(this.overlayEl),this.boundaryEl.appendChild(this.viewportEl),this.container.appendChild(this.boundaryEl),this.options.showZoomer){let V=E();this.sliderEl=D(this.zoomConfig.min,this.zoomConfig.max,this.transform.scale),V.appendChild(this.sliderEl),this.container.appendChild(V);let G=()=>{if(this.sliderEl){let J=this.transform.scale;this.setZoom(Number.parseFloat(this.sliderEl.value)),this.emitEvent("zoom",{zoom:this.transform.scale,previousZoom:J})}};this.sliderEl.addEventListener("input",G),this.cleanupFns.push(()=>{this.sliderEl?.removeEventListener("input",G)})}this.element.appendChild(this.container)}attachEventHandlers(){if(!this.boundaryEl||!this.previewEl)return;let V=f(this.boundaryEl,()=>this.transform,(J,K)=>{this.transform.x=J,this.transform.y=K,this.updateTransform(),this.emitUpdate()});if(this.cleanupFns.push(V),this.options.mouseWheelZoom){let J=this.options.mouseWheelZoom==="ctrl",K=Z(this.boundaryEl,()=>this.transform.scale,(N)=>this.setZoom(N),this.zoomConfig,{onChange:(N,Q)=>{this.emitEvent("zoom",{zoom:N,previousZoom:Q})}},J);this.cleanupFns.push(K)}let G=w(this.boundaryEl,()=>this.transform.scale,(J)=>this.setZoom(J),this.zoomConfig,{onChange:(J,K)=>{this.emitEvent("zoom",{zoom:J,previousZoom:K})}});this.cleanupFns.push(G)}async bind(V){let G=typeof V==="string"?{url:V}:V;if(this.image=await y(G.url),this.previewEl)this.previewEl.src=this.image.src;let J=L(this.image.naturalWidth,this.image.naturalHeight,this.options.viewport.width,this.options.viewport.height);if(this.zoomConfig.enforceMinimumCoverage!==!1)this.effectiveMinZoom=Math.max(this.zoomConfig.min,J);else this.effectiveMinZoom=this.zoomConfig.min;let K=G.zoom??J;if(this.transform={x:0,y:0,scale:q(K,this.effectiveMinZoom,this.zoomConfig.max)},this.sliderEl)this.sliderEl.min=String(this.effectiveMinZoom);if(G.points){let N=W(G.points);if(N)console.warn("[@bayinformatics/croppie] Initial points are not yet fully supported. Provided:",N)}this.updateTransform(),this.updateSlider()}async bindFile(V){let G=await H(V);await this.bind({url:G})}async result(V){if(!this.image)throw Error("No image bound");let G=this.getPoints(),J=this.options.viewport,K,N;if(V.size==="viewport")K=J.width,N=J.height;else if(V.size==="original")K=G.bottomRightX-G.topLeftX,N=G.bottomRightY-G.topLeftY;else if(V.size)K=V.size.width,N=V.size.height;else K=J.width,N=J.height;let Q=k(this.image,G,K,N,{circle:V.circle??J.type==="circle",backgroundColor:V.backgroundColor});switch(V.type){case"canvas":return Q;case"base64":return C(Q,V.format,V.quality);case"blob":return z(Q,V.format,V.quality);default:throw Error(`Unknown result type: ${V.type}`)}}get(){return{points:this.getPoints(),zoom:this.transform.scale}}get zoom(){return this.transform.scale}set zoom(V){this.setZoom(V)}setZoom(V){let G=this.transform.scale;if(this.transform.scale=q(V,this.effectiveMinZoom,this.zoomConfig.max),this.updateTransform(),this.updateSlider(),G!==this.transform.scale)this.emitUpdate()}rotate(V){console.warn("Rotation not yet implemented:",V)}reset(){if(this.image){let V=L(this.image.naturalWidth,this.image.naturalHeight,this.options.viewport.width,this.options.viewport.height),G=q(V,this.effectiveMinZoom,this.zoomConfig.max);this.transform={x:0,y:0,scale:G},this.updateTransform(),this.updateSlider(),this.emitUpdate()}}destroy(){for(let V of this.cleanupFns)V();if(this.cleanupFns=[],this.eventHandlers.clear(),this.container?.parentNode)this.container.parentNode.removeChild(this.container);this.container=null,this.boundaryEl=null,this.viewportEl=null,this.overlayEl=null,this.previewEl=null,this.sliderEl=null,this.image=null}on(V,G){if(!this.eventHandlers.has(V))this.eventHandlers.set(V,new Set);this.eventHandlers.get(V)?.add(G)}off(V,G){this.eventHandlers.get(V)?.delete(G)}updateTransform(){if(this.previewEl){let V=this.options.boundary.width,G=this.options.boundary.height,J=this.image?.naturalWidth??0,K=this.image?.naturalHeight??0,N=J*this.transform.scale,Q=K*this.transform.scale,$=(V-N)/2+this.transform.x,B=(G-Q)/2+this.transform.y;P(this.previewEl,$,B,this.transform.scale)}}updateSlider(){if(this.sliderEl)this.sliderEl.value=String(this.transform.scale)}getPoints(){if(!this.image)return{topLeftX:0,topLeftY:0,bottomRightX:0,bottomRightY:0};let V=this.options.viewport,G=this.options.boundary,J=this.image.naturalWidth,K=this.image.naturalHeight,N=J*this.transform.scale,Q=K*this.transform.scale,$=(G.width-N)/2+this.transform.x,B=(G.height-Q)/2+this.transform.y,A=(G.width-V.width)/2,_=(G.height-V.height)/2,I=(A-$)/this.transform.scale,F=(_-B)/this.transform.scale,S=I+V.width/this.transform.scale,M=F+V.height/this.transform.scale;return{topLeftX:Math.max(0,I),topLeftY:Math.max(0,F),bottomRightX:Math.min(J,S),bottomRightY:Math.min(K,M)}}emitUpdate(){this.emitEvent("update",this.get())}emitEvent(V,G){let J=this.eventHandlers.get(V);if(J)for(let K of J)K(G)}}export{b as default,b as Croppie};

//# debugId=8AA6028A65FE1D2C64756E2164756E21
//# sourceMappingURL=croppie.js.map