class ToolTip{
	static MARGIN = 5;
	static DIR = {
		TOP:'top',
		RIGHT:'right',
		BUTTOM:'bottom',
		LEFT:'left'
	}

	constructor(el, options = {}){
		this.__rootEl = el;
		this.__title = options.title || "ToolTip";
		this.__dir = ToolTip.__getDir(options.dir);

		this.__init();
		if(options.defaultEvents)
			this.__initDefEvents();
	}
	
	get dir(){
		return this.__dir;
	}
	set dir(dir){
		if(!ToolTip.checkDir(dir))
			throw new Error("Unknown dir.");

		this.__el.classList.remove(this.__dir);
		this.__dir = dir;
		this.__el.classList.add(dir);
	}

	get title(){
		return this.__title;
	}
	set title(value){
		this.__title = value;
		this.__el.innerHTML = value;
	}

	__init(){
		this.__rootEl.title = "";

		this.__el = document.createElement("div");
		this.__el.innerHTML = this.__title;
		this.__el.classList.add("tooltip", this.__dir);

		Object.defineProperty(this.__rootEl, "tooltip", {
			get: (function() { return this; }).bind(this),
		})
	}

	__initDefEvents(){
		this.__rootEl.addEventListener("mouseover", function(){this.tooltip.show()});
		this.__rootEl.addEventListener("mouseout", function(){this.tooltip.hide()});
	}

	show(){
		this.__el.style.top = (this.__rootEl.offsetTop + (
			this.__dir == "top" ? -ToolTip.MARGIN : 
			this.__dir == "bottom" ? ToolTip.MARGIN + this.__rootEl.offsetHeight :
			this.__rootEl.offsetHeight / 2
		)) + "px";

		this.__el.style.left = (this.__rootEl.offsetLeft + (
			this.__dir == "left" ? -ToolTip.MARGIN : 
			this.__dir == "right" ? ToolTip.MARGIN + this.__rootEl.offsetWidth :
			this.__rootEl.offsetWidth / 2
		)) + "px";

		document.body.appendChild(this.__el);

		this.__el.style.width = this.__el.offsetWidth+1 + "px"
	}

	hide(){
		this.__el.style.width = null;
		document.body.removeChild(this.__el);
	}

	static checkDir(dir){
		return Object.values(ToolTip.DIR).indexOf(dir) != -1;
	}

	static __getDir(dir){
		if(ToolTip.checkDir(dir))
			return dir;

		return ToolTip.DIR.TOP;
	}

	static __init(){
		document.querySelectorAll("[title]").forEach(function(el){
			if(!el.tooltip)
				new ToolTip(el, {
					title:el.title,
					dir:el.dataset.dir,
					defaultEvents:true
				});
		});
	}
}
LoadEvent.addHandler(ToolTip.__init);