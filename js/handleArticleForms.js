/*
 * Created by Stefan Korecko, 2020
 * Functions to handle forms for article editing and inserting
 */

//Pridanie funkcionality pre kliknutie na tlacidlo "Nahraj obrázok / Upload image"
//Adding functionality for the button "Nahraj obrázok / Upload image"
function showFileUpload(){
    document.getElementById('fsetFileUpload').classList.remove("hiddenElm");
    document.getElementById('btShowFileUpload').classList.add("hiddenElm");
}


//Pridanie funkcionality pre kliknutie na tlacidlo "Zruš nahrávanie / Cancel uploading"
//Adding functionality for the button "Zruš nahrávanie / Cancel uploading"
function cancelFileUpload(){
    document.getElementById('fsetFileUpload').classList.add("hiddenElm");
    document.getElementById('btShowFileUpload').classList.remove("hiddenElm");
}


/**
 * Uploads an image to the server
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api.
 */
function uploadImg(serverUrl) {

    const files=document.getElementById("flElm").files;

    if (files.length>0){
        const imgLinkElement = document.getElementById("imageLink");
        const fieldsetElement = document.getElementById("fsetFileUpload");
        const btShowFileUploadElement = document.getElementById("btShowFileUpload");

        //1. Gather  the image file data

        let imgData = new FormData();     //obrazok su binarne udaje, preto FormData (pouzitelne aj pri upload-e viac suborov naraz)
                                          //and image is binary data, that's why we use FormData (it works for multiple file upload, too)
        imgData.append("file", files[0]); //beriem len prvy obrazok, ved prvok formulara by mal povolit len jeden
                                          //takes only the first file (image)

        //2. Set up the request


        const postReqSettings = //an object wih settings of the request
            {
                method: 'POST',
                body: imgData //FormData object, not JSON this time.
                //pozor:nezadavat content-type. potom to nepojde.
                //Beware: It doesn't work correctly if the content-type is set.
            };


        //3. Execute the request

        fetch(`${serverUrl}/fileUpload`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
            .then(response => {      //fetch promise fullfilled (operation completed successfully)
                if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                    return response.json(); //we return a new promise with the response data in JSON to be processed
                } else { //if we get server error
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
                }
            })
            .then(responseJSON => { //here we process the returned response data in JSON ...
                imgLinkElement.value=responseJSON.fullFileUrl;
                btShowFileUploadElement.classList.remove("hiddenElm");
                fieldsetElement.classList.add("hiddenElm");
            })
            .catch(error => { ////here we process all the failed promises
                window.alert(`Image uploading failed. ${error}.`);
            });
    }else{
        window.alert("Please, choose an image file.");
    }



}

/**
 * Process form data and sends the article to server
 * @param event - event objet, to prevent default processing
 * @param articleId - id of the article to be updated
 * @param offset - current offset of the article list display to which the user should return
 * @param totalCount - total number of articles on the server
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api.

 */
function processArtAddFrmData(event,articleId,offset, totalCount, serverUrl){
    event.preventDefault();


    //1. Gather and check the form data

    const articleData = {
        title: document.getElementById("title").value.trim(),
        content: document.getElementById("content").value.trim(),
        author: document.getElementById("author").value.trim(),

        imageLink:document.getElementById("imageLink").value.trim(),
        tags:document.getElementById("tags").value.trim()
    };

    if (!(articleData.title && articleData.content)) {
        window.alert("Please, enter article title and content");
        return;
    }

    if (!articleData.author) {
        articleData.author = "Anonymous";
    }

    if (!articleData.imageLink) {
        delete articleData.imageLink;
    }

    articleData.tags=articleData.tags.split(","); //zmeni retazec s tagmi na pole. Oddelovac poloziek je ciarka.
    //changes the string with tags to array. Comma is the separator
    articleData.tags=articleData.tags.map(tag => tag.trim()); //odstráni prázdne znaky na začiatku a konci každého kľúčového slova
    //deletes white spaces from the beginning and the end of each tag string

    //newArtData.tags=newArtData.tags.map(function(tag) {return tag.trim()}); //alternativny sposob zapisu predch. prikazu
    //an alternative way of writing the previous command

    articleData.tags=articleData.tags.filter(tag => tag); //odstráni tie tagy, ktoré sú teraz len prázdne reťazce
    //removes those tags that are now just empty strings
    articleData.tags[articleData.tags.length]="htmlBlog";


    //2. Set up the request


    const postReqSettings = //an object wih settings of the request
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(articleData)
        };


    //3. Execute the request


    fetch(`${serverUrl}/article/`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
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
        .finally(() => window.location.hash=`#articles/1/2`);

}

function processArtEditFrmData(event,articleId,offset, totalCount, serverUrl){
    event.preventDefault();


    //1. Gather and check the form data

    const articleData = {
        title: document.getElementById("title").value.trim(),
        content: document.getElementById("content").value.trim(),
        author: document.getElementById("author").value.trim(),

        imageLink:document.getElementById("imageLink").value.trim(),
        tags:document.getElementById("tags").value.trim()
    };

    if (!(articleData.title && articleData.content)) {
        window.alert("Please, enter article title and content");
        return;
    }

    if (!articleData.author) {
        articleData.author = "Anonymous";
    }

    if (!articleData.imageLink) {
        delete articleData.imageLink;
    }

    if (!articleData.tags) {
        delete articleData.tags;
    }else{
        articleData.tags=articleData.tags.split(","); //zmeni retazec s tagmi na pole. Oddelovac poloziek je ciarka.
        //changes the string with tags to array. Comma is the separator
        articleData.tags=articleData.tags.map(tag => tag.trim()); //odstráni prázdne znaky na začiatku a konci každého kľúčového slova
        //deletes white spaces from the beginning and the end of each tag string

        //newArtData.tags=newArtData.tags.map(function(tag) {return tag.trim()}); //alternativny sposob zapisu predch. prikazu
        //an alternative way of writing the previous command

        articleData.tags=articleData.tags.filter(tag => tag); //odstráni tie tagy, ktoré sú teraz len prázdne reťazce
                                                            //removes those tags that are now just empty strings
        if(articleData.tags.length==0){
            delete articleData.tags;
        }
    }

    //2. Set up the request


    const postReqSettings = //an object wih settings of the request
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(articleData)
        };


    //3. Execute the request


    fetch(`${serverUrl}/article/${articleId}`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => { //here we process the returned response data in JSON ...
            window.alert("Updated article successfully saved on server");
        })
        .catch(error => { ////here we process all the failed promises
            window.alert(`Failed to save the updated article on server. ${error}`);

        })
        .finally(() => window.location.hash=`#article/${articleId}/${offset}/${totalCount}`);

}

function processCommAddFrmData(event,articleId,offset, totalCount, serverUrl){
    event.preventDefault();


    //1. Gather and check the form data

    const articleData = {
        text: document.getElementById("text").value.trim(),
        author: document.getElementById("commentAuthor").value.trim(),
    };

    if (!(articleData.author && articleData.text)) {
        window.alert("Please, enter article title and content");
        return;
    }

    if (!articleData.author) {
        articleData.author = "Anonymous";
    }

    //2. Set up the request


    const postReqSettings = //an object wih settings of the request
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(articleData)
        };


    //3. Execute the request


    fetch(`${serverUrl}/article/${articleId}/comment`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => { //here we process the returned response data in JSON ...
            window.alert("Added comment successfully saved on server");
        })
        .catch(error => { ////here we process all the failed promises
            window.alert(`Failed to save the comment on server. ${error}`);

        })
        .finally(() => window.location.hash=`#article/${articleId}/${offset}/${totalCount}`);
}


function deleteArt(articleId,offset, totalCount, serverUrl) {
    fetch(`${serverUrl}/article/${articleId}`, {
        method: 'DELETE',
    })
        .then(res => res.text())
        .then(res => {
            window.alert("Deleted article successfully.");
        })
        .catch(error => {
            window.alert(`Failed to save the updated article on server. ${error}`);

        })
}


