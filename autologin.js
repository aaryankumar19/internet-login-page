function autoSignIn() {
  chrome.storage.local.get(["id", "password"], (result) => {
    if (!result.id || !result.password) {
      window.alert("Error: ID or Password is missing in storage!");
      return; // Stop if credentials are missing
    }

    // Fill username
    const usernameField = document.querySelector('input[name="username"]');
    if (usernameField) usernameField.value = parseInt(atob(result.id));

    // Fill password
    const passwordField = document.querySelector('input[name="password"]');
    if (passwordField) passwordField.value = atob(result.password);

    // Click login button
    const loginButton = document.getElementById('loginbtn');
    if (loginButton) loginButton.click();
  });
}

// Trigger on double-click
document.addEventListener('dblclick', autoSignIn);


// Get the image URL from the extension's directory
const image1 = chrome.runtime.getURL("images/hitler.jpg");
const image2 = chrome.runtime.getURL("images/nazi-logo.png");

  
  function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
    button.btn.btn-primary.btn-sm {
    background-color: white;
    color: black;
    font-weight: bolder;
    border: 3px solid red;
    height: ;
    }

    body{
    background-image: url("${image1}");
    }


    div div img {
    display: none;
    }

    div.col-lg-12.login-section.text-center {
    background-image: url("${image2}");
    width: 450px;
        height: 450px;
        border: 5px solid red;
        border-radius: 50%;

    }

    p.pt-2.pb-3 {
    visibility: hidden;
    }

    a.mt-2.mb-3.btn.btn-primary.btn-sm {
    visibility: hidden;
    }

    div.col-lg-8.login-section {
    display: none;
    }

    div.col-lg-4.login-field {
    height: 0px;
    width: 300px;
    }

    div.pt-2.pb-3 {
    margin-top: 50%;;
    }

    h4.card-title {
    visibility: hidden;
    }


    label.form-label {
    color: red;
    font-weight: bolder;
    }

    /* div div strong {
    color: white;
    visibility: hidden;
    } */

    a.btn.btn-primary.btn-sm {
    visibility: hidden;
    }

    .mt-2 .cdiv{
    visibility: hidden;
    }

    input[type="checkbox"] {
        visibility: hidden;
    }

    .buttonstyle {
    background-color: rgba(51, 51, 51, 0.7);
    color: rgba(255, 255, 255, 0);
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
    }

.buttonstyle:hover {
  background-color: rgba(51, 51, 51, 0.6);
  color: rgba(255, 255, 255, 1);
  font-size: 26px;
  font-weight: bold;
}


    input.buttonstyle {
    width: 23.5%;
    height: 48.5%;
    border-radius: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: auto;
    text-align: center;
    background-color: rgba(255, 0, 0, 0);
    }

    div.col-lg-12.login-section.text-center {
    background-image: url("${image2}");
    width: 450px;
    height: 450px;
    border: 5px solid red;
    border-radius: 50%;
    animation: rotateAnimation 5s linear infinite;
    position: relative;
    }

    @keyframes rotateAnimation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    }

    input[name="logout"] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) !important;
    border-radius: 100%;
    width:100%;
    height:100%;
    z-index: 1;
    }

    div.mt-2.cdiv:has(input[name="saveinfo"]) {
  display: none !important;
}

p.alert {
  position: fixed;
  top: 20px; /* distance from the top */
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999; /* make sure it's on top of everything */
  margin: 0;
}

p.alert strong {
  color: red;
  background-color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  display: inline-block;
  width: 400px;
  text-align: center;
}
  `;
  document.head.appendChild(style);
}

chrome.storage.local.get("themeEnabled", (result) => {
  if (result.themeEnabled) {
    injectCSS();
  }
});

window.onload = function () {
  chrome.storage.local.get('themeEnabled', (result) => {
    if (result.themeEnabled === true) {
      document.body.style.backgroundImage = `url('${image1}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
  });
};

const cls = document.getElementsByClassName('btn');

for(var i = 0; i < cls.length; i++){
  cls[i].removeAttribute("disabled"); 
}
