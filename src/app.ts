async function pageLoad(){
    const urlParams = new URLSearchParams(window.location.search);
    const bracketId = urlParams.get("bracketId");
    const round = parseInt(urlParams.get("round")) ?? 1;
    const minRound = urlParams.get("minRound") ?? "1";
    const focus = urlParams.get("focus") ?? "none";
    console.log(minRound)

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
    setTimeout(() => { //bad code but fixes a bug only happening on OBS
        centerOnElements();
    }, 250);
}

async function updateGraphicURLs(event){
    const outElim = document.getElementById("out") as HTMLInputElement;
    const bracketId = (document.getElementById("bracketId") as HTMLInputElement).value;

    const matchesReq = await getMatchesFromBracketID(bracketId);
    const bracketType = matchesReq.bracketType;
    const numRounds = matchesReq.numRounds;
    console.log(numRounds);
    const urls = [];

    switch (bracketType){
        case "doubleelim":
            urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}`);
            urls.push(`Winners only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&focus=winners`);
            urls.push(`Losers only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&focus=losers`);
            if (numRounds > 3){
                urls.push(`Top 16:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&minRound=${numRounds-3}`);
            }
            break;
        
        case "singleelim":
            urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}`);
            if (numRounds > 5){
                urls.push(`Top 16:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&minRound=${numRounds-3}`);
            }
            break;

        case "roundrobin":
        case "swiss":
            for (let i = 1; i <= numRounds; i++){
                urls.push(`Round ${i}:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&round=${i}`);
            }
            break;
    }

    let builder = urls[0];
    for (let i = 1; i < urls.length; i++){
        builder += "\n" + urls[i];
    }
    outElim.value = builder;
}