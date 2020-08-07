class Popup{
	static __popupsContainer = null;
	static __openedPopup = null;
	static __inited = false;

	static __init(){
		if(Popup.__inited) return;

		Popup.__popupsContainer = document.querySelector("div.popup--shadow");
		if(!Popup.__popupsContainer){
			Popup.__popupsContainer = document.createElement("div");
			Popup.__popupsContainer.classList.add("popup--shadow");

			document.body.appendChild(Popup.__popupsContainer);
		}

		Popup.__inited = true;
	}

	constructor(id, options = {}){
		Popup.__init();
		
		if(typeof id == "string")
			id = document.getElementById(id);

		this._el = id;
		this._el.classList.add("popup");

		if(options.classes)
			this._el.classList.add(...options.classes);

		Popup.__popupsContainer.appendChild(this._el);

		this.__setup(options.title);
	}
	
	__setup(title = "Popup Window"){
		let header = this._el.querySelector("header");
		if(!header){
			header = document.createElement("header");
			header.innerText = title;
			this._el.querySelector("main").before(header);
		}
		let times = document.createElement("i");
		times.classList.add("fas", "fa-times", "popup--close");
		this.close = this.close.bind(this);

		times.addEventListener("click", this.close)
		header.appendChild(times);

		this._el.__init = true;
		Object.defineProperty(this._el, "class", {
			get: (function() { return this; }).bind(this),
		})
	}

	open(){
		document.body.classList.add("popup--open");
		this._el.classList.add("open");

		if(Popup.__openedPopup)
			Popup.__openedPopup._el.classList.remove("open");
		else{
			this._el.classList.add("opened");
			setTimeout((function(){
				this.classList.remove("opened")
			}).bind(this._el), 300);
		}


		Popup.__openedPopup = this;
	}

	close(){
		// document.body.classList.remove("popup--open");
		// this._el.classList.remove("open");
		
		this._el.classList.add("closed");

		setTimeout((function(){
			this._el.classList.remove("open", "closed")
			document.body.classList.remove("popup--open");
		}).bind(this), 300);
		Popup.__openedPopup = null;
	}

	static __initWindows(){
		document.querySelectorAll(".popup").forEach(popup => {
			if(popup.__init) return;

			if(popup.id)
				window[popup.id] = new Popup(popup);
			else
				new Popup(popup);
		})
	}
}
LoadEvent.addHandler(Popup.__initWindows)
