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