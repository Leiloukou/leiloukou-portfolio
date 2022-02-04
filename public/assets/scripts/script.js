const publicVapidKey =
	"BKLbDVcT-wXUN4H2WY8-a8imgK74uwDthIxAUnrqt8fnO7XvqEvqjaHmo4p7kzZWUQjnzBCxREW4jYB3Zp88ipg";

if ("ServiceWorker" in navigator) {
	send().catch((err) => console.error(err));
}

async function send() {
	const register = await navigator.serviceWorker.register("/sw.js", {
		scope: "./../../",
	});

	const subscription = await register.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
	});

	await fetch("/subscribe", {
		method: "POST",
		body: JSON.stringify(subscription),
		headers: {
			"content-type": "application/json",
		},
	});
}

let rmBtn = document.getElementById("read-more-btn");
let rlBtn = document.getElementById("read-less-btn");
let readMore = document.getElementById("read-more");

rmBtn.addEventListener("click", () => {
	readMore.style.display = 'block'
	rmBtn.style.display = 'none'
	rlBtn.style.display = 'inline'
})

rlBtn.addEventListener("click", () => {
	readMore.style.display = 'none'
	rmBtn.style.display = 'inline'
	rlBtn.style.display = 'none'
})

function urlBase64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

const locS = {
	get(key) {
		return localStorage.getItem(key);
	},
	set(key, value) {
		localStorage.setItem(key, value);
	},
	remove(key) {
		localStorage.removeItem(key);
	},
	reset() {
		localStorage.clear();
	},
	// preserveKey(key)
	// {
	//     LeiloukouPreserveKey = {}
	// }
};

const wbr = document.querySelector(".wbr");
const wbr2 = document.querySelector(".wbr2");

if (matchMedia("(max-width: 5750px)").matches) {
	// If media query matches
	wbr.innerHTML = "<br>";
	wbr2.innerHTML = "<br>";
} else {
	wbr.innerHTML = "";
	wbr2.innerHTML = "";
}

let intersectionNumber = 0;
const callbackFunction = function (entries) {
	intersectionNumber++;

	if (intersectionNumber == 2) {
		modalOne();
	}
};
const observer = new IntersectionObserver(callbackFunction);

function modalOne() {
	document.getElementById("modal").style.transform = "translateY(0)";
	document.body.style.overflow = "hidden";
	setTimeout(() => {
		document.getElementById("backBtn1").style.transform = "scale(1)";
	}, 500);
}

document.getElementById("backBtn1").addEventListener("click", (e) => {
	document.getElementById("modal").style.transform = "translateY(-100%)";
	document.body.style.overflowY = "scroll";
});

document.getElementById("yesBtn1").addEventListener("click", (e) => {
	document.getElementById("modal").style.transform = "translateY(-100%)";
	document.body.style.overflowY = "scroll";
	setTimeout(() => {
		location.href = "./../../hire/index.html";
	}, 400);
});

observer.observe(document.getElementById("footer"));
