declare var gsap: any;

async function pageLoad(){
    const urlParams = new URLSearchParams(window.location.search);
    const bracketId = urlParams.get("bracketId");
    const round = parseInt(urlParams.get("round")) ?? 1;
    const minRound = urlParams.get("minRound") ?? "1";
    const focus = urlParams.get("focus") ?? "none";
    const title = urlParams.get("title");
    const refresh = parseInt(urlParams.get("refresh"));

    const battlefyRes = await getMatchesFromBracketID(bracketId);
    const bracketStyle = battlefyRes.bracketType;
    const matches = battlefyRes.matches;
    
    const zoom = document.getElementById("zoom");
    switch(bracketStyle){
        case "singleelim":
            zoom.appendChild(getEliminationElement(matches, parseInt(minRound)));
            break;
        case "doubleelim":
            zoom.appendChild(getDoubleEliminationElement(matches, parseInt(minRound), focus));
            break;
        case "swiss":
            zoom.appendChild(getSwissElement(matches, round));
            break;
        case "roundrobin":
            zoom.appendChild(getRoundRobinElement(matches, round));
    }

    document.getElementById("title").innerText = title;

    centerOnElements();

    if (!Number.isNaN(refresh) && refresh != 0){
        setInterval(function () {
            console.log("Refreshing...");
            autoRefresh();
        }, refresh * 1000);
    }
    
    console.log("Graphic Data: ", {
        bracketId,
        bracketStyle,
        matches,
        round,
        minRound,
        focus,
        title,
        refresh
    })
}

async function autoRefresh(){
    const urlParams = new URLSearchParams(window.location.search);
    const bracketId = urlParams.get("bracketId");

    const battlefyRes = await getMatchesFromBracketID(bracketId);
    const matches = battlefyRes.matches;

    const elements = document.querySelectorAll(".group-round-wrapper, .elim-round-wrapper");
    for (var i = 0; i < elements.length; i++){
        const matchId = (elements[i] as HTMLElement).dataset.matchId;
        const match = matches.find(x => x.id == matchId);
        if (match) {
            const element = elements[i] as HTMLElement;
            const topElement = element.querySelector(".top") as HTMLElement;
            const bottomElement = element.querySelector(".bottom") as HTMLElement;
            const topName = topElement.querySelector(".team") as HTMLElement;
            const bottomName = bottomElement.querySelector(".team") as HTMLElement;
            const topSeed = topElement.querySelector(".seed") as HTMLElement ?? undefined;
            const bottomSeed = bottomElement.querySelector(".seed") as HTMLElement ?? undefined;
            const topScore = topElement.querySelector(".score") as HTMLElement;
            const bottomScore = bottomElement.querySelector(".score") as HTMLElement;
            
            if (!((getLimitedName(match.topName) == topName.innerText || match.topName == undefined && topName.innerText == "-")
                && (getLimitedName(match.bottomName) == bottomName.innerText || match.bottomName == undefined && bottomName.innerText == "-")
                && (match.topScore == topScore.innerText || match.topScore == undefined && topScore.innerText == "-")
                && (match.bottomScore == bottomScore.innerText || match.bottomScore == undefined && bottomScore.innerText == "-"))){

                if (getLimitedName(match.topName) == topName.innerText && getLimitedName(match.bottomName) == bottomName.innerText){
                    
                    topScore.innerText = match.topScore === undefined ? "-" : match.topScore.toString();
                    bottomScore.innerText = match.bottomScore === undefined ? "-" : match.bottomScore.toString();
                    if (match.topWinner) {
                        topElement.classList.add("winner");
                    } else {
                        topElement.classList.remove("winner");
                    }
                    if (match.bottomWinner) {
                        bottomElement.classList.add("winner");
                    } else {
                        bottomElement.classList.remove("winner");
                    }

                    if (match.topWinner || match.bottomWinner){
                        element.dataset.roundStatus = "finished";
                    } else if (match.topName !== undefined && match.bottomName === undefined || match.topName === undefined && match.bottomName !== undefined){
                        element.dataset.roundStatus = "awaiting";
                    } else if (match.topName !== undefined || match.bottomName !== undefined){
                        element.dataset.roundStatus = "in-progress"
                    } else {
                        element.dataset.roundStatus = "not-started";
                    }

                    centerOnElements(true);
                } else {

                    const tl = gsap.timeline();

                    tl.to(element, {opacity: 0, duration: 1, ease: "power2.in", onComplete: () => {

                        const domRect = element.getBoundingClientRect();
                        const scale = parseFloat((document.querySelector("#zoom") as HTMLElement).style.transform.replace("scale(", "").replace(")", ""));
                        console.log(element, domRect.width, scale, domRect.width / scale);
                        element.style.width = `${domRect.width / scale}px`;

                        topName.innerText = match.topName === undefined ? "-" : getLimitedName(match.topName);
                        bottomName.innerText = match.bottomName === undefined ? "-" : getLimitedName(match.bottomName);
                        topScore.innerText = match.topScore === undefined ? "-" : match.topScore.toString();
                        bottomScore.innerText = match.bottomScore === undefined ? "-" : match.bottomScore.toString();

                        if (topSeed !== undefined && bottomSeed !== undefined){
                            topSeed.innerText = match.topSeed === undefined ? "-" : match.topSeed.toString();
                            bottomSeed.innerText = match.bottomSeed === undefined ? "-" : match.bottomSeed.toString();
                        }
    
                        if (match.topWinner || match.bottomWinner){
                            element.dataset.roundStatus = "finished";
                        } else if (match.topName !== undefined && match.bottomName === undefined || match.topName === undefined && match.bottomName !== undefined){
                            element.dataset.roundStatus = "awaiting";
                        } else if (match.topName !== undefined || match.bottomName !== undefined){
                            element.dataset.roundStatus = "in-progress"
                        } else {
                            element.dataset.roundStatus = "not-started";
                        }
    
                        if (match.topWinner) {
                            topElement.classList.add("winner");
                        } else {
                            topElement.classList.remove("winner");
                        }
                        if (match.bottomWinner) {
                            bottomElement.classList.add("winner");
                        } else {
                            bottomElement.classList.remove("winner");
                        }
    
                    }});
                    tl.to(element, {duration: 1, width: "auto", ease: "power2.inOut"});
                    tl.to(element, {opacity: 1, duration: 1, ease: "power2.out", onStart: () => {
                        centerOnElements(true);
                    }});
                }
            } else {
                centerOnElements();
            }
        }
    }
}

async function updateGraphicURLs(event){
    const outElim = document.getElementById("out") as HTMLInputElement;
    const bracketUrl = (document.getElementById("bracketUrl") as HTMLInputElement).value;
    const bracketTitle = (document.getElementById("bracketTitle") as HTMLInputElement).value;
    const refreshFreq = (document.getElementById("refreshFreq") as HTMLInputElement).value;

    const bracketId = getID(bracketUrl);

    const matchesReq = await getMatchesFromBracketID(bracketId);
    const bracketType = matchesReq.bracketType;
    const numRounds = matchesReq.numRounds;
    console.log(numRounds);
    const urls = [];

    switch (bracketType){
        case "doubleelim":
            urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(bracketTitle)}&refresh=${refreshFreq}`);
            urls.push(`Winners only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Winners`)}&refresh=${refreshFreq}&focus=winners`);
            urls.push(`Losers only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Losers`)}&refresh=${refreshFreq}&focus=losers`);
            if (numRounds > 4){
                urls.push(`Top 24:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Top 24`)}&minRound=${numRounds-2}&refresh=${refreshFreq}`);
            }
            break;
        
        case "singleelim":
            urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(bracketTitle)}&refresh=${refreshFreq}`);
            if (numRounds > 5){
                urls.push(`Top 16:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Top 16`)}&minRound=${numRounds-3}&refresh=${refreshFreq}`);
            }
            break;

        case "roundrobin":
        case "swiss":
            for (let i = 1; i <= numRounds; i++){
                urls.push(`Round ${i}:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Round ${i}`)}&round=${i}&refresh=${refreshFreq}`);
            }
            break;
    }

    let builder = urls[0];
    for (let i = 1; i < urls.length; i++){
        builder += "\n" + urls[i];
    }
    outElim.value = builder;
}

function getID(search) {
    if (search.includes("https://battlefy.com/")){
        const split = search.split("/")
        if(split[7] !== undefined){
            return split[7]
        }
    } else {
        return search
    }
}