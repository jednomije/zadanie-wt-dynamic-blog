let auth2 = {};

function renderLogOutInfo(htmlElmId) {
    const htmlString=`<p>User not signed in</p>`;
    document.getElementById(htmlElmId).innerHTML=htmlString;
}

function signOut() {
    if(auth2.signOut) auth2.signOut();
    if(auth2.disconnect) auth2.disconnect();

}

function userChanged(user){
    let userInfoElm = document.getElementById("userStatus");
    if(userInfoElm ){
        renderUserInfo(user,"userStatus");
    }

}


let updateSignIn = function() {
    let sgnd = auth2.isSignedIn.get();
    if (sgnd) {
        document.getElementById("SignInButton").classList.add("hiddenElm");
        document.getElementById("SignedIn").classList.remove("hiddenElm");
        document.getElementById("googleUserName").innerHTML=auth2.currentUser.get().getBasicProfile().getName();
    }else{
        document.getElementById("SignInButton").classList.remove("hiddenElm");
        document.getElementById("SignedIn").classList.add("hiddenElm");
    }
}

function getName() {
    if(auth2.isSignedIn.get()){
        return auth2.currentUser.get().getBasicProfile().getName();
    }else return null;
}

function startGSingIn() {
    gapi.load('auth2', function() {
        gapi.signin2.render('SignInButton', {
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then(
            function (){
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn);
            });
    });

}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
    console.log(error);
}
