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