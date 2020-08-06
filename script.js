// Add function in Storage 
Storage.prototype.getItemWithDefault = function(key, defValue){
	let value = this.getItem(key);


	if(value == undefined && defValue !== undefined){
		this.setItem(key, defValue);
		return defValue;
	}
	
	return value;
}

Toast.TIMEOUT = 2.5;
Notification.HEADER = "<i class=\"fab fa-html5\"></i> Notification";

//Theme
let ColorScheme = document.createElement("link");
ColorScheme.rel = "stylesheet";
ColorScheme.type = "text/css";
ColorScheme.setScheme = function(scheme){
	this.scheme = scheme;
	localStorage.setItem("scheme", scheme);
	this.href = `WebUI/ColorScheme/${scheme}.css`;
}
ColorScheme.setScheme(localStorage.getItemWithDefault("scheme", "default"));
document.head.appendChild(ColorScheme);

//Dark Mode
let DarkColorScheme = document.createElement("link");
DarkColorScheme.rel = "stylesheet";
DarkColorScheme.type = "text/css";
DarkColorScheme.href = "WebUI/ColorScheme/default-dark.css";
let darkOn = localStorage.getItemWithDefault("dark", false);

if(darkOn == "true")
	document.head.appendChild(DarkColorScheme);

LoadEvent.addHandler(()=>{
	let darkSwitcher = document.getElementById("dark-switcher");
	let SunIcon = document.querySelector(".theme-switcher .fa-sun"),
		MoonIcon = document.querySelector(".theme-switcher .fa-moon");

	if(darkOn == "true"){
		darkSwitcher.checked = true;
		SunIcon.classList.add("far");
		SunIcon.classList.remove("fas");
		MoonIcon.classList.add("fas");
		MoonIcon.classList.remove("far");
		delete darkOn;
	}

	darkSwitcher.addEventListener("change", function(){
		localStorage.setItem("dark", this.checked);

		if(this.checked){
			document.head.appendChild(DarkColorScheme);
			SunIcon.classList.add("far");
			SunIcon.classList.remove("fas");
			MoonIcon.classList.add("fas");
			MoonIcon.classList.remove("far");
		} else {
			document.head.removeChild(DarkColorScheme);
			SunIcon.classList.add("fas");
			SunIcon.classList.remove("far");
			MoonIcon.classList.add("far");
			MoonIcon.classList.remove("fas");
		}
	});
})
