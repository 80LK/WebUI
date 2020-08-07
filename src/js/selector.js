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