// 加密，需要明文和密钥
function encryptCaesar(plaintext:string, key:number) {
	if (!(/^0|[1-9]\d$/.test(key.toString()))) {
		return new Error('请输入非负整数');
	}
	let arr = plaintext.toString().split('');
	let charCodeOf_a = 'a'.charCodeAt(0); // 小写字母a的ASCII码值
	let charCodeOf_A = 'A'.charCodeAt(0); // 大写字母A的ASCII码值

	for (let i = 0; i < arr.length; i ++) {
		let currentChar = arr[i].charCodeAt(0); // 当前字母的ASCII码值
		let cycle = 0; // 奇数改变大小写，偶数不变，默认不变
		if (/^[a-z]+$/.test(arr[i])) {
		    let offset_a = currentChar - charCodeOf_a + key; // 算法中的f(x) + key
		    cycle = parseInt((offset_a / 26).toString());
			currentChar = charCodeOf_a + offset_a % 26;
			let temp = String.fromCharCode(currentChar);
			arr[i] = cycle % 2 ? temp.toUpperCase() : temp;
		} else if (/^[A-Z]+$/.test(arr[i])) {
		    let offset_A = currentChar - charCodeOf_A + key;
		    cycle = parseInt((offset_A / 26).toString());
			currentChar = charCodeOf_A + (offset_A) % 26;
			let temp = String.fromCharCode(currentChar);
            arr[i] = cycle % 2 ? temp.toLowerCase() : temp;
		}
	}
	return arr.join('');
}

// 解密，需要密文和密钥
function decryptCaesar(ciphertext:string, key:number) {
	if (!(/^0|[1-9]\d$/.test(key.toString()))) {
		return new Error('请输入非负整数');
	}
	let arr = ciphertext.toString().split('');
	let charCodeOf_a = 'a'.charCodeAt(0);
	let charCodeOf_A = 'A'.charCodeAt(0);

	for (let i = 0; i < arr.length; i ++) {
		let currentChar = arr[i].charCodeAt(0);
		let cycle = 1;
		if (/^[a-z]+$/.test(arr[i])) {
		    let offset_a = currentChar - charCodeOf_a - key;
		    // 注意offset_a为正时不需要变换大小写
		    cycle = offset_a < 0 ? parseInt((offset_a / 26).toString()) : 1;
            if (charCodeOf_a + offset_a < charCodeOf_a) {
                offset_a = offset_a % 26 + 26;
            }
            currentChar = charCodeOf_a + offset_a;
			let temp = String.fromCharCode(currentChar);
			arr[i] = cycle % 2 ? temp : temp.toUpperCase();
		} else if (/^[A-Z]+$/.test(arr[i])) {
		    let offset_A = currentChar - charCodeOf_A - key;
		    // 注意offset_A为正时不需要变换大小写
		    cycle = offset_A < 0 ? parseInt((offset_A / 26).toString()) : 1;
		    if (charCodeOf_A + offset_A < charCodeOf_A) {
		        offset_A = offset_A % 26 + 26;
		    }
			currentChar = charCodeOf_A + offset_A;
			let temp = String.fromCharCode(currentChar);
            arr[i] = cycle % 2 ? temp : temp.toLowerCase();
		}
	}
	return arr.join('');
}
console.log(encryptCaesar('Didi Family', 10)); // "nsns pkwsvi"
console.log(decryptCaesar('"nsns pkwsvi"', 10));