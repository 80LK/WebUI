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
		this.__rootEl.addEventListener("mouseover", function(){
			this.tooltip.show()
		});
		this.__rootEl.addEventListener("mouseout", function(e){
			if(!this.contains(e.relatedTarget))
				this.tooltip.hide()
		});
	}


	get top(){
		return this.__top || 0;
	}
	get left(){
		return this.__left || 0;
	}

	set top(value){
		this.__top = value;
		this.__el.style.top = value + "px";
	}
	set left(value){
		this.__left = value;
		this.__el.style.left = value + "px";
	}

	show(){
		if(this.__opened) return;
		clearTimeout(this.__timeout);

		this.__opened = true;
		
		this.top = (this.__rootEl.offsetTop + (
			this.__dir == "top" ? 0 : 
			this.__dir == "bottom" ? this.__rootEl.offsetHeight :
			this.__rootEl.offsetHeight / 2
		));

		this.left = (this.__rootEl.offsetLeft + (
			this.__dir == "left" ? 0 : 
			this.__dir == "right" ? this.__rootEl.offsetWidth :
			this.__rootEl.offsetWidth / 2
		));

		setTimeout((function(){
			if(this.__dir == "top" || this.__dir == "bottom")
				this.top += (this.__dir == "top" ? -ToolTip.MARGIN : ToolTip.MARGIN);
			else
				this.left += (this.__dir == "left" ? -ToolTip.MARGIN : ToolTip.MARGIN);

			this.__el.style.opacity = 1;
		}).bind(this), 1);

		document.body.appendChild(this.__el);

		this.__el.style.width = this.__el.offsetWidth+1 + "px"
	}

	hide(){
		if(!this.__opened) return;

		this.__opened = false;

		this.__el.style.width = null;
		setTimeout((function(){
			if(this.__dir == "top" || this.__dir == "bottom")
				this.top -= (this.__dir == "top" ? -ToolTip.MARGIN : ToolTip.MARGIN);
			else
				this.left -= (this.__dir == "left" ? -ToolTip.MARGIN : ToolTip.MARGIN);

			this.__el.style.opacity = 0;
		}).bind(this), 1);
		this.__timeout = setTimeout((function(){
			document.body.removeChild(this);
		}).bind(this.__el), 300);
		this.__el.style.opacity = 0;
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