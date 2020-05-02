let comments=[];

if(localStorage.myWebSiteComments){
    comments=JSON.parse(localStorage.myComments);
}

console.log(comments);

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
            created: new Date()
        };

    console.log("New opinion:\n " + JSON.stringify(newComment));

    comments.push(newComment);

    localStorage.myComments = JSON.stringify(comments);

    error.innerHTML="<p>Your comment has been stored.<\p>";

    console.log("New opinion added");
    console.log(comments);

    form.reset();
}
