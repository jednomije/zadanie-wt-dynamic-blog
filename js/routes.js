export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"welcome",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML
    },

    {
        hash:"articles",
        target:"router-view",
        getTemplate: createHtml4Main

    },

    {
        hash:"opinions",
        target:"router-view",
        getTemplate: createHtml4opinions
    },

    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: opinionForm
    },

    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },

    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },

    {
        hash:"artInsert",
        target:"router-view",
        getTemplate: addArticle
    },

    {
        hash:"artDelete",
        target:"router-view",
        getTemplate: deleteArticle
    },

    {
        hash:"addComment",
        target:"router-view",
        getTemplate:commentForm
    }

];

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;

function opinionForm(targetElm) {
    let buf={
        author:getName()
    };
    buf.name=getName();
    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-addOpinion").innerHTML,
        buf
    );
}

function createHtml4opinions(targetElm){
    const init={
        headers: {
            "X-Parse-Application-Id": "TaPijjQgI8wc4aHEz2S97gDnC70i2twABa9wDiOA",
            "X-Parse-REST-API-Key": "BcFahHRXTlvnwv0aEDrI8zItD9taW0rZisg1wvWo",
            "Content-Type": "application/json"
        },
        method: 'GET'
    };
    const url="https://parseapi.back4app.com/classes/opinions";

    fetch(url,init)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            responseJSON.results.createdOn = (new Date(responseJSON.results.createdOn)).toDateString();
            responseJSON.results.ratingMessage = responseJSON.results.rating ? "I will return to this page." : "Sorry, one visit was enough.";
            responseJSON.results.platformMessage = responseJSON.results.phone ? "handheld." : "desktop.";
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-opinions").innerHTML,
                responseJSON.results
            );
            window.alert("opinion successfully got from the server.");
        })
        .catch(error => {
            window.alert(`Failed to get opinion from server. ${error}`);

        })
}

function createHtml4Main2(targetElm,newCurr){
    let current=newCurr,totalCount;
    const data4rendering = {
        currPage: current,
    };

    if (current > 1) {
        data4rendering.prevPage = current - 1;
    }

    if (current < totalCount) {
        data4rendering.nextPage = current + 1;
    }

    fetchAndProcessArticle(targetElm, data4rendering, (current - 1) * 5, totalCount*5);
}

function createHtml4Main(targetElm,newCurr){
    const url = `${urlBase}/article?tag=htmlBlog&max=20`;
    let current=Number(1),totalCount=Number(1);
    fetch(url)  //there may be a second parameter, an object wih options, but we do not need it now.
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{
                return Promise.reject(new Error(`Failed to access the list of articles. Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => {
            console.log(responseJSON);
            if(newCurr==null){
                current=Math.floor((Number(responseJSON.meta.offset)/20)+1);
            }else current=newCurr;
            totalCount=Math.floor((Number(responseJSON.meta.totalCount)/20)+1);
            Promise.resolve();
        })
        .then(()=> {
            const data4rendering = {
                currPage: current,
                pageCount: totalCount
            };

            if (current > 1) {
                data4rendering.prevPage = current - 1;
            }

            if (current < totalCount) {
                data4rendering.nextPage = current + 1;
            }

            fetchAndDisplayArticles(targetElm, data4rendering, (current - 1) * 20, totalCount*20);
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
            Mustache.render(
            document.getElementById("template-articles-error").innerHTML,
            errMsgObj
        );
    });
}

function fetchAndDisplayArticles(targetElm, data, offsetFromHash, totalCountFromHash){
    let urlQuery = "";
    const offset=Number(offsetFromHash);
    const totalCount=Number(totalCountFromHash);

    if (offset && totalCount){
        urlQuery=`?tag=htmlBlog&offset=${offset}&max=${articlesPerPage}`;
    }else{
        urlQuery=`?tag=htmlBlog&max=${articlesPerPage}`;
    }

    const url = `${urlBase}/article${urlQuery}`;
    const serverUrl = "http://wt.kpi.fei.tuke.sk/api/article";
    let articleList =[];
    let responseJSONBuffer;
    fetch(url)  //there may be a second parameter, an object wih options, but we do not need it now.
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{
                return Promise.reject(new Error(`Failed to access the list of articles. Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => {
            responseJSONBuffer=responseJSON;
            articleList=responseJSON.articles;
            return Promise.resolve();
        })
        .then( ()=> {

            let prrt;

            let cntRequests = articleList.map(
                article => fetch(`${serverUrl}/${article.id}`)
            );
            return Promise.all(cntRequests);
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{
                articleList[index].content=article.content;
            });
            return Promise.resolve();
        })
        .then( () =>{
        renderArticles(articleList);
    }).catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

    function renderArticles(responseJSON) {
        responseJSON.offset=responseJSONBuffer.meta.offset;
        responseJSON.totalCount=responseJSONBuffer.meta.totalCount;
        responseJSON =
            responseJSON.map(
                article =>(
                    {
                        ...article,
                        detailLink:`#article/${article.id}/${responseJSON.offset}/${responseJSON.totalCount}/1`
                    }
                )
            );
        responseJSON.currPage=data.currPage;
        responseJSON.prevPage=data.prevPage;
        responseJSON.nextPage=data.nextPage;
        responseJSON.pageCount=data.pageCount;
        document.getElementById(targetElm).innerHTML =
            Mustache.render(
                document.getElementById("template-articles").innerHTML,
                responseJSON
            );
    }
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,newCurr,commentForm) {
    let current=Number(newCurr),totalCount=Number(6);
    console.log(newCurr);
    const data4rendering = {
        currPage: current,
        pageCount: totalCount
    };

    if (current > 1) {
        data4rendering.prevPage = current - 1;
    }

    if (current < totalCount) {
        data4rendering.nextPage = current + 1;
    }
    fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,data4rendering,false,commentForm);
}

function newArticleForm(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    const url = `${urlBase}/article/`;
    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            responseJSON.author=getName();
            responseJSON.formTitle = "New Article";
            responseJSON.formSubmitCall =
                `processArtAddFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
            responseJSON.submitBtTitle = "Save article";
            responseJSON.urlBase = urlBase;
            responseJSON.backLink = `#articles/${(offsetFromHash/20)}/${(totalCountFromHash/20)}`;

            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-article-form").innerHTML,
                    responseJSON
                );
        });
}

function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,data,forEdit,commentForm) {
    const url = `${urlBase}/article/${artIdFromHash}`;
    let urlComm;
        if (forEdit){
            urlComm=`${urlBase}/article/${artIdFromHash}/comment?max=5`;
        }else urlComm=`${urlBase}/article/${artIdFromHash}/comment?max=5&offset=${(data.currPage-1)*5}`;
    let comment;
    fetch(urlComm)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        }).then(responseJSON => {
            comment=responseJSON.comments;
            return Promise.resolve();
        }).then(()=> fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        }).then(responseJSON => {
            if(forEdit){
                responseJSON.formTitle="Article Edit";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
                responseJSON.submitBtTitle="Save article";
                responseJSON.urlBase=urlBase;
                responseJSON.backLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}/1`;
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
            }else{
                if(!commentForm)responseJSON.hidden="hidden";
                responseJSON.prevPage=`#article/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}/${data.prevPage}`;
                responseJSON.nextPage=`#article/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}/${data.nextPage}`;
                responseJSON.currPage=data.currPage;
                responseJSON.pageCount=data.pageCount;
                responseJSON.tags.shift();
                responseJSON.addCommentLink=`#addComment/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.backLink=`#articles/${(offsetFromHash/20)}/${(totalCountFromHash/20)}`;
                responseJSON.editLink=`#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.deleteLink=`#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.comments=comment;
                console.log(comment);
                responseJSON.formTitle="Add comment";
                responseJSON.formSubmitCall =
                    `processCommAddFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
                responseJSON.submitBtTitle="Save comment";
                responseJSON.urlBase=urlBase;
                responseJSON.backLink=`#articles/${offsetFromHash}`;
                responseJSON.author=getName();
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        responseJSON
                    );
            }

        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        }));
}

function commentForm(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndDisplayArticleDetail(...arguments,1,true);
}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments,0,true,false);
}

function addArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    newArticleForm(...arguments);
}

function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    deleteArt(artIdFromHash,offsetFromHash,totalCountFromHash,urlBase);
    window.location=`#articles/${(offsetFromHash/20)}/${(totalCountFromHash/20)}`;
}
