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
		this.__timeout = setTimeout(this.destroy, seconds * 1000);
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