function processGetData(event) {
    event.preventDefault();

    let form=document.getElementById("form");
    let error=document.getElementById("error");

    const username = form.elements["username"].value.trim();
    const email = form.elements["email"].value.trim();
    const comment = form.elements["comment"].value;
    const image = form.elements["image"].value;
    const phone = form.elements["phone"].value;
    const radio = form.elements["rating"].value;
    const browser = form.elements["browser"].value;
    const keywords = form.elements["keywords"].value;
    if (username == "" || comment == "" || email == "") {
        error.innerHTML="<p>Please, enter your name, email and comment.<\p>";
        return;
    }

    const newComment =
        {
            name: username,
            email: email,
            comment: comment,
            image: image,
            phone: phone,
            rating: radio[0],
            browser: browser,
            keywords: keywords,
        };
    console.log(newComment);

    const init={
        headers: {
            "X-Parse-Application-Id": "TaPijjQgI8wc4aHEz2S97gDnC70i2twABa9wDiOA",
            "X-Parse-REST-API-Key": "BcFahHRXTlvnwv0aEDrI8zItD9taW0rZisg1wvWo",
            "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify(newComment)
    };
    const url="https://parseapi.back4app.com/classes/opinions";
    fetch(url,init)
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => { //here we process the returned response data in JSON ...
            window.alert("new article successfully saved on server");
        })
        .catch(error => { ////here we process all the failed promises
            window.alert(`Failed to save new article on server. ${error}`);

        })
    console.log("New opinion:\n " + JSON.stringify(newComment));

    error.innerHTML="<p>Your comment has been stored.<\p>";

    console.log("New opinion added");

    form.reset();
}
