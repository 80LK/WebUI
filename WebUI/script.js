/*
	BUILD INFO:
		Folder: src/js
		Target: WebUI/script.js
		Files: 11
*/

///LoadEvent.js
const LoadEvent = {
	__handlers:[],
	addHandler:function(handler, priority = 10){
		if(typeof handler != "function")
			return console.warn(new Error("LoadEvent.addHandler accepts only the function"));

		LoadEvent.__handlers.push([priority, handler]);
	},
	__init:function(){
		addEventListener("load", ()=>LoadEvent.__handlers.sort((a,b)=> a[0] > b[0] ? 1 : -1).forEach(handle=>handle[1]()));
	}
};
LoadEvent.__init();

///btn-wave.js
LoadEvent.addHandler(function(){
	let span;
	
	function hideWave(e){
		if(!span) return;
		
		span.classList.add("btn--wave--hidding");
		setTimeout((function(){
			this.remove();
		}).bind(span), 500);
		span = null;
	}

	document.querySelectorAll(".btn").forEach(
	el => {

		el.addEventListener('mousedown', function(e){
			span = document.createElement("span");
			span.classList.add("btn--wave");

			let box = this.getBoundingClientRect();

			span.style.setProperty("--radius", (Math.ceil(box.width > box.height ? box.width : box.height) * 2) + "px");

			span.style.left = (e.pageX - window.pageXOffset - box.left) + "px";
			span.style.top = (e.pageY - window.pageYOffset - box.top) + "px";

			this.appendChild(span);
		}, false);

		el.addEventListener('mouseup', hideWave, false);
		el.addEventListener('mouseleave', hideWave, false);
	})
});

///focus-group.js
LoadEvent.addHandler(function(){
	document.querySelectorAll(".input-group").forEach( group => {
		group.querySelectorAll("input, .select").forEach( e => {
			e.addEventListener("focus", (ev) => {console.log(ev); group.classList.add("focus")} )
			e.addEventListener("blur", () => group.classList.remove("focus") )
		})
	})
});

///preloader.js
LoadEvent.addHandler(()=>{
	let preloader = document.getElementById("preloader");
	if(preloader){
		preloader.remove();
		delete preloader;
	}

	document.body.classList.remove("loading");
}, 9999)

///selector.js
class Selector{
	static DEFAULT_TOOLTIP = "Hold <span class='badge'>SHIFT</span> to select multiple items.";
	constructor(id, options = {}){
		if(typeof id == "string")
			id = document.getElementById(id);

		this._el = id;
		this._el.classList.add("select");

		this._items = [];

		if(this._el.dataset.rendered == undefined)
			this._render(options.placeholder, options.items || []);
		else
			this._parseRender(options);

		this._setup(options);
	}
	
	_parseRender(options){
		if(this._el.dataset.multi != undefined)
			options.multi = true;
		let selected = [];

		this._title = this._el.querySelector(".select--placeholder").innerText;

		this._el.querySelectorAll(".select--item").forEach((el, i)=>{
			let item = { title:el.innerText };

			if(!el.dataset.value)
				el.dataset.value = el.innerText

			item.value = el.dataset.value;

			el.dataset.index = i;

			this._items.push(item)
			
			if(el.classList.contains("selected"))
				selected.push(i);
		});

		if(options.multi)
			options.selected = selected;
		else
			options.selected = selected[0];
	}

	_render(placeholder = "Select item"){
		this._title = placeholder;
		this._el.innerHTML = `<div class="select--placeholder">${placeholder}</div><ul class='select--list'></ul>`;
	}

	set(items){
		this.reset();
		this._items = items;

		let i = 0;
		this._list.innerHTML = this._items.map(e => {
			if(e.value !== undefined)
				return `<li class="select--item" data-type="item" data-index="${i++}" data-value="${e.value}">${e.title || e.value}</li>`
			else
				return `<li class="select--category" data-type="item">${e.title}</li>`
		}).join("");

		this._items = this._items.filter(e=>e.value !== undefined);
	}

	_setup(options){
		this._multi = options.multi || false;

		this._selectedNodes = this._multi ? [] : null;
		this._selected = this._multi ? [] : -1;

		this._placeholder = this._el.querySelector(".select--placeholder");
		this._list = this._el.querySelector(".select--list");

		this.set(options.items);

		this._click = this._click.bind(this);
		addEventListener("click", this._click);

		if(options.selected != undefined)
			if(options.selected instanceof Array){
				if(this._multi)
					options.selected.forEach(i => this.selectItem(i));
				else
					console.warn("Selector is not MultiSelector")
			}else{
				this.selectItem(options.selected)
			}

		LoadEvent.addHandler((()=>{
			if(document.body.clientHeight - this._el.offsetTop - this._el.offsetHeight < 160)
				this._el.classList.add("select--bottom");
		}).bind(this));

		Object.defineProperty(this._el, "value", {
			get: (function() { return this.value; }).bind(this),
  			set: (function(newValue) { this.value = newValue; }).bind(this)
		})
		Object.defineProperty(this._el, "class", {
			get: (function() { return this; }).bind(this),
		})

		this._el.__init = true;

		if(options.onchange)
			this.addChangeHandler(options.onchange);

		if(this._multi && !this._el.title)
			new ToolTip(this._el, {
				title:this._el.title || Selector.DEFAULT_TOOLTIP,
				dir:this._el.dataset.dir,
				defaultEvents:true
			});
	}

	_click(e){
		if(e.target == this._el){
			if(this._el.getAttribute("disabled") == null)
				this.toggle();
		} else {
			if(e.target.dataset.type && e.target.dataset.type == "item")
				if(e.target.parentElement.parentElement == this._el){
					if(e.target.classList.contains("select--category"))
						return;
					this.selectItem(e.target.dataset.index);
					if(Keyboard.checkPressed("ShiftLeft", "ShiftLeft") && this._multi)
						return;
				}

			this.close();
		}
	}

	get count(){
		return this._items.length;
	}

	get value(){
		if(this._multi){
			return this._selected.map(i => this._items[this._selected].value);
		} else {
			if(this._selected == -1) return;

			return this._items[this._selected].value;
		}
	}

	set value(value){
		let i = this._items.findIndex(el => el.value == value);
		if(i == -1)
			throw new Error(`Item with value "${value}" not found.`);

		this.selectItem(i);
	}

	addChangeHandler(handler){
		this._el.addEventListener("change", handler);
		return handler;
	}

	removeChangeHandler(handler){
		this._el.removeEventListener("change", handler)
	}

	selectItem(index){
		if(index < 0)
			throw new Error(`Index has been >=0.`);

		if(index > this.count)
			throw new Error(`Index outside the array.`);

		this._placeholder.classList.add("selected")

		if(this._multi){
			let i = this._selected.indexOf(index);
			if(i != -1){
				this._selected[i] = null;
				this._selectedNodes[i].classList.remove("selected");
				this._selectedNodes[i] = null;


				this._selected = this._selected.filter(e => e != null);
				this._selectedNodes = this._selectedNodes.filter(e => e != null);
			}else{
				this._selected.push(index);
				let i = this._selectedNodes.push(this._el.querySelector(`.select--item[data-index="${index}"]`)) -1;
				this._selectedNodes[i].classList.add("selected");
			}

			this._placeholder.innerText = this._selected.map(e => this._items[e].title || this._items[e].value).join(", ") || this._title;
			if(this._selected.length == 0)
				this._placeholder.classList.remove("selected");
		} else {
			if(this._selected == index)
				return;

			this._selected = index;

			if(this._selectedNodes)
				this._selectedNodes.classList.remove("selected");

			this._placeholder.innerText = this._items[index].title || this._items[index].value;
			this._selectedNodes = this._el.querySelector(`.select--item[data-index="${index}"]`);
			this._selectedNodes.classList.add("selected");
		}

		this._el.dispatchEvent(new Event("change", {
			value:this.value
		}))
	}

	toggle(){
		if(this._isOpen)
			this.close();
		else
			this.open();
	}

	open(){
		this._isOpen = true;
		
		this._el.dispatchEvent(new Event("focus"));
		this._el.classList.add("open");
	}

	close(){
		this._isOpen = false;
		
		this._el.dispatchEvent(new Event("blur"));
		this._el.classList.remove("open")
	}

	reset(){
		if(this._multi){
			if(this._selectedNodes.length > 0)
				this._selectedNodes.forEach(e=>e.classList.remove("selected"));
			this._selectedNodes = [];
			this._selected = [];
		}else{
			if(this._selectedNodes)
				this._selectedNodes.classList.remove("selected");
			this._selectedNodes = null;
			this._selected = -1;
		}

		this._placeholder.innerText = this._title;
		this._placeholder.classList.remove("selected");
	}

	destroy(){
		this._el.innerHTML = "";
		this._el.classList.remove("select");
		removeEventListener("click", this._click);
	}

	remove(){ this.destroy(); }

	static __init(){
		document.querySelectorAll(".select[data-rendered]").forEach(selector => {
			if(selector.id)
				window[selector.id] = new Selector(selector);
			else
				new Selector(selector);	
		})
	}
}
LoadEvent.addHandler(Selector.__init);

///popup.js
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


///progress-bar.js
class ProgressBar{
	constructor(bar, options = {}){
		if(typeof bar === "string")
			bar = document.getElementById(bar);

		this.__bar = bar;
		this.__bar.classList.add("progress-bar");

		this.__render(bar.dataset.title || options.label);
		
		let value = bar.dataset.value || options.value;
		
		if(value)
			this.set(value);

		bar.__init = true;

		Object.defineProperty(bar, "class", {
			get: (function() { return this; }).bind(this),
		})
	}

	__render(title){
		let label, $title,
			labelAppend = false;

		if(!(label = this.__bar.querySelector(".progress-bar--label"))){
			label = document.createElement("div");
			label.classList.add("progress-bar--label");
			labelAppend = true;
		}

		if(labelAppend || !($title = label.querySelector(".progress-bar--title"))){
			$title = document.createElement("div");
			$title.classList.add("progress-bar--title");
			label.appendChild($title);
		}

		if(title)
			$title.innerText = title;
		
		if(labelAppend || !(this.__value = label.querySelector(".progress-bar--value"))){
			this.__value = document.createElement("div");
			this.__value.classList.add("progress-bar--value");
			label.appendChild(this.__value);
		}

		if(!(this.__scale = this.__bar.querySelector(".progress-bar--bar"))){
			this.__scale = document.createElement("div");
			this.__scale.classList.add("progress-bar--bar");
			this.__bar.appendChild(this.__scale);
		}


		if(labelAppend)
			this.__bar.append(label);
	}

	set(value = 0){
		this.__scale.style.width 
			= this.__value.innerText 
			= value + "%";
	}

	static __init(){
		document.querySelectorAll(".progress-bar").forEach(function(bar){
			if(bar.__init) return;

			if(bar.id)
				window[bar.id] = new ProgressBar(bar);
			else
				new ProgressBar(bar);
		});
	}
}
LoadEvent.addHandler(ProgressBar.__init)

///keyboard.js
const Keyboard = {
	__keys:{},
	__init(){
		addEventListener("keydown", ( e => this.__keys[e.code] = true ).bind(this))
		addEventListener("keyup", ( e => delete this.__keys[e.code]).bind(this))
		addEventListener("blur", ( () =>{
			for(let i in this.__keys)
				delete this.__keys[i];
		}).bind(this))
	},

	checkPressed(...KeyCode){
		for(let i = 0, l = KeyCode.length; i < l; i++)
			if(this.__keys[KeyCode[i]])
				return true;

		return false;
	}
}
Keyboard.__init();

///tooltip.js
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

///dropdown.js
class Dropdown{
	constructor(el){
		if(typeof el == "string")
			el = document.getElementById("el");

		this.__el = el;

		this.__init();
	}

	__init(){
		this.__click = this.__click.bind(this);
		addEventListener("click", this.__click);
	}

	__click(e){
		if(e.target.parentElement == this.__el){
			if(this.__el.getAttribute("disabled") == null)
				this.toggle();
		} else {
			this.close();
		}
	}

	toggle(){
		this.__el.classList.toggle("open");
	}
	open(){
		this.__el.classList.add("open");
	}
	close(){
		this.__el.classList.remove("open");
	}


	shop(){ this.open() }
	hide(){ this.close() }

	static __init(){
		document.querySelectorAll(".dropdown").forEach(dropdown => {
			if(!dropdown.class)
				new Dropdown(dropdown);
		})
	}
}
LoadEvent.addHandler(Dropdown.__init);

///toast.js
class Toast{
	static __inited = false;
	static __container = null;
	static TIMEOUT = 5;

	static __init(){
		if(Toast.__inited) return;

		Toast.__container = document.querySelector("div.toasts--container");

		if(!Toast.__container)
			Toast.__container = document.createElement("div");

		Toast.__container.classList.add("toasts--container");

		document.body.appendChild(Toast.__container);

		Toast.__inited = true;
	}

	static default(text, live = Toast.TIMEOUT, isHTML = false){
		new Toast(text, {
			live:live,
			isHTML:isHTML
		});
	}
	static secondary(text, live = Toast.TIMEOUT, isHTML = false){
		new Toast(text, {
			live:live,
			type:"secondary",
			isHTML:isHTML
		});
	}
	static success(text, live = Toast.TIMEOUT, isHTML = false){
		new Toast(text, {
			live:live,
			type:"success",
			isHTML:isHTML
		});
	}
	static info(text, live = Toast.TIMEOUT, isHTML = false){
		new Toast(text, {
			live:live,
			type:"info",
			isHTML:isHTML
		});
	}
	static warning(text, live = Toast.TIMEOUT, isHTML = false){
		new Toast(text, {
			live:live,
			type:"warning",
			isHTML:isHTML
		});
	}
	static danger(text, live = Toast.TIMEOUT, isHTML = false){
		new Toast(text, {
			live:live,
			type:"danger",
			isHTML:isHTML
		});
	}

	constructor(text, options = {}){
		this.__init(text, options);
	}


	__init(text, options = {}){
		this.__el = document.createElement("div");
		this.__el.classList.add("toast");

		if(options.type){
			options.type = options.type.toLowerCase()
			if(["success", "warning", "danger", "info", "secondary", "default"].indexOf(options.type) == -1)
				console.warn(new Error("Unknown type toast."));
			else
				this.__el.classList.add(options.type);
		}
		let title = document.createElement("span")
		title.classList.add("toast--title");

		if(options.isHTML)
			title.innerHTML = text;
		else
			title.innerText = text;

		this.__el.appendChild(title);
		
		let destroy = document.createElement("i");
		destroy.classList.add("fas", "fa-times", "toast--close");

		this.__el.appendChild(destroy);

		this.__setup(destroy, options.live);
	}

	__setup(closeEl, seconds = Toast.TIMEOUT){
		console.log(seconds);
		this.destroy = this.destroy.bind(this);
		closeEl.addEventListener("click", this.destroy);

		seconds *= 1000;

		setTimeout((function(){
			this.classList.add("closed");
		}).bind(this.__el), seconds-500);
		this.__timeout = setTimeout(this.destroy, seconds);

		Toast.__container.appendChild(this.__el);
	}
	destroy(){
		clearTimeout(this.__timeout);
		this.__el.remove();
	}
}
LoadEvent.addHandler(Toast.__init);

class Notification extends Toast{
	static HEADER = "<i class=\"fas fa-bell\"></i> Notification";
	
	constructor(a, b = {}){
		super(a, b);
	}
	
	__init(HTMLContent, options = {}){
		this.__el = document.createElement("div");
		this.__el.classList.add("notification");

		this.destroy = this.destroy.bind(this);

		let title = document.createElement("header");
		// title.classList.add("notification--title");
		title.innerHTML = options.title || Notification.HEADER || "<i class=\"fas fa-bell\"></i> Notification";

		let destroy = document.createElement("i");
		destroy.classList.add("fas", "fa-times", "notification--close");

		title.appendChild(destroy);

		this.__el.appendChild(title);

		let main = document.createElement("main");
		main.innerHTML = HTMLContent;
		this.__el.appendChild(main);

		options.foot = options.foot || options.footer || null;

		if(options.foot){
			let footer = document.createElement("footer");
			footer.innerHTML = options.foot;
			this.__el.appendChild(footer);
		}

		this.__setup(destroy, options.live);
	}
}

