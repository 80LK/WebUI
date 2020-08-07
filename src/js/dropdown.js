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