async function pageLoad(){
    const urlParams = new URLSearchParams(window.location.search);
    const bracketId = urlParams.get("bracketId");
    const round = parseInt(urlParams.get("round")) ?? 1;
    const minRound = urlParams.get("minRound") ?? "1";
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
            zoom.appendChild(getDoubleEliminationElement(matches, parseInt(minRound)));
            break;
        case "swiss":
            zoom.appendChild(getSwissElement(matches, round));
            break;
        case "roundrobin":
            zoom.appendChild(getRoundRobinElement(matches, round));
    }
    centerOnElements();
}