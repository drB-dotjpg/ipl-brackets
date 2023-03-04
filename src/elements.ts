function getDoubleEliminationElement(matches: Match[], minRound: number, focus: string) : HTMLElement{
    const element: HTMLElement = document.createElement("div");
    
    const winnersMatches: Match[] = [];
    const losersMatches: Match[] = [];
    
    for (var i = 0; i < matches.length; i++){
        if (matches[i].type == "winner"){
            winnersMatches.push(matches[i]);
        } else {
            losersMatches.push(matches[i]);
        }
    }

    const winnersElement: HTMLElement = getEliminationElement(winnersMatches, minRound, "winners");
    winnersElement.dataset.bracketType = "winners";
    const losersMinRound = minRound == 1 ? minRound : minRound - 1;
    const losersElement: HTMLElement = getEliminationElement(losersMatches, losersMinRound, "losers");
    losersElement.dataset.bracketType = "losers";

    if (focus != "losers"){
        element.appendChild(winnersElement);
    }
    if (focus != "winners"){
        element.appendChild(losersElement);
    }
    
    return element;
}

function getEliminationElement(matches: Match[], minRound: number, roundNaming?: "winners" | "losers") : HTMLElement {
    const element: HTMLElement = document.createElement("div");
    element.className = "elim-bracket-wrapper";
    element.classList.add("bracket");

    const roundElims: HTMLElement[] = [];
    const roundsNum = Math.max(...matches.map(o => o.roundNumber));
    const horConnectorElims: HTMLElement[] = [];
    const vertConnectorElims: HTMLElement[] = [];

    if (minRound <= 0){
        minRound = 1;
    }

    for (var i = minRound-1; i < roundsNum; i++){
        const roundElim = document.createElement("div");
        roundElim.className = "elim-grid-wrapper";
        const roundHeader = document.createElement("div");
        roundHeader.className = "grid-header";

        if (roundNaming == "winners" && i == roundsNum - 2){
            roundHeader.innerText = "Grand Finals";
        } 
        else if (roundNaming == "winners" && i == roundsNum - 1){
            roundHeader.innerText = "Reset";
        }
        else if (roundNaming == "losers" && i == roundsNum - 1){
            roundHeader.innerText = "Losers Finals";
        }
        else if (i == roundsNum - 1){
            roundHeader.innerText = "Finals";
        }
        else {
            roundHeader.innerText = "Round " + (i+1);
        }

        roundElim.appendChild(roundHeader);
        roundElims.push(roundElim);
        element.appendChild(roundElim);

        if (i < roundsNum - 1){
            const horConnector = document.createElement("div");
            horConnector.className = "elim-grid-wrapper hor-connector";
            horConnector.style.width = "15px";
            const connectorHeader = document.createElement("div");
            connectorHeader.className = "grid-header";
            horConnector.appendChild(connectorHeader);
            horConnectorElims.push(horConnector);
            element.appendChild(horConnector);

            const vertConnector = horConnector.cloneNode(true) as HTMLElement;
            vertConnector.classList.remove("hor-connector");
            vertConnector.classList.add("vert-connector");
            vertConnector.style.width = "";
            vertConnectorElims.push(vertConnector);
            element.appendChild(vertConnector);
        }
    }

    for (var i = 0; i < matches.length; i++){
        const elim = getEliminationStyleMatchElement(matches[i]);
        if (matches[i].roundNumber >= minRound){
            roundElims[matches[i].roundNumber-minRound].appendChild(elim);
        } else if (matches[i].roundNumber == 0) {
            elim.classList.add("elim-third");
            const roundElim = roundElims[roundElims.length-1];
            roundElim.appendChild(elim);
            roundElim.style.minHeight = "12em";

            elim.style.transformOrigin = "bottom left";
            if (roundElims[0].childNodes.length < 8){
                elim.style.marginLeft = "5px";
                elim.style.scale = "0.7";
            } else if (roundElims[0].childNodes.length < 16){
                elim.style.scale = ".8";
            }
        }
    }

    for (var i = 0; i < matches.length; i++){
        if (matches[i].roundNumber >= minRound && matches[i].roundNumber < roundsNum && matches[i].roundNumber != 0) {
            const horConnector = document.createElement("div");
            horConnector.style.height = "1px";
            horConnector.style.background = "var(--connector-color)";
            horConnectorElims[matches[i].roundNumber-minRound].appendChild(horConnector);

            if (roundElims[matches[i].roundNumber-minRound].childNodes.length % 2 == 1
                && getNumberChildrenWithoutThird(roundElims[matches[i].roundNumber-minRound]) != getNumberChildrenWithoutThird(roundElims[matches[i].roundNumber-minRound + 1])){
                const vertConnector = document.createElement("div");
                vertConnector.style.width = "1px";
                if (i % 2 == 1){
                    vertConnector.style.background = "linear-gradient(0deg, transparent 50%, var(--connector-color) 50%, var(--connector-color) 100%)";
                } else {
                    vertConnector.style.background = "linear-gradient(180deg, transparent 50%, var(--connector-color) 50%, var(--connector-color) 100%)";
                }
                vertConnectorElims[matches[i].roundNumber-minRound].appendChild(vertConnector);
            }
        }
    }

    return element;
}

function getNumberChildrenWithoutThird(element: HTMLElement){
    let count = 0;
    for (var i = 0; i < element.childNodes.length; i++){
        const child = element.childNodes[i] as HTMLElement;
        if (!child.classList.contains("elim-third")){
            count++;
        }
    }
    return count;
}

function getEliminationStyleMatchElement(match: Match): HTMLElement {
    const element = document.createElement("div");
    element.className = "elim-round-wrapper";

    if (match.topWinner || match.bottomWinner){
        element.dataset.roundStatus = "finished";
    } else if (match.topName !== undefined && match.bottomName === undefined || match.topName === undefined && match.bottomName !== undefined){
        element.dataset.roundStatus = "awaiting";
    } else if (match.topName !== undefined || match.bottomName !== undefined){
        element.dataset.roundStatus = "in-progress"
    } else {
        element.dataset.roundStatus = "not-started";
    }

    element.dataset.matchId = match.id;

    const topTeam = document.createElement("div");
    topTeam.className = "team-wrapper top";

    if (match.topWinner){
        topTeam.classList.add("winner");
    }

    const topSeed = document.createElement("div");
    topSeed.classList.add("seed");
    topSeed.innerText = match.topSeed !== undefined ? match.topSeed.toString() : "-";
    
    const topName = document.createElement("div");
    topName.className = "team";
    topName.innerText = match.topName !== undefined ? getLimitedName(match.topName) : "-";

    const topScore = document.createElement("div");
    topScore.className = "score";
    topScore.innerText = match.topScore !== undefined ? match.topScore.toString() : "-";

    topTeam.appendChild(topSeed)
    topTeam.appendChild(topName);
    topTeam.appendChild(topScore);

    const bottomTeam = document.createElement("div");
    bottomTeam.className = "team-wrapper bottom";

    if (match.bottomWinner) {
        bottomTeam.classList.add("winner");
    }

    const bottomSeed = document.createElement("div");
    bottomSeed.classList.add("seed");
    bottomSeed.innerText = match.bottomSeed !== undefined ? match.bottomSeed.toString() : "-";

    const bottomName = document.createElement("div");
    bottomName.className = "team";
    bottomName.innerText = match.bottomName !== undefined ? getLimitedName(match.bottomName) : "-";

    const bottomScore = document.createElement("div");
    bottomScore.className = "score";
    bottomScore.innerText = match.bottomScore !== undefined ? match.bottomScore.toString() : "-";

    bottomTeam.appendChild(bottomSeed);
    bottomTeam.appendChild(bottomName);
    bottomTeam.appendChild(bottomScore);

    element.appendChild(topTeam);
    element.appendChild(bottomTeam);

    return element;
}

function getSwissElement(matches: Match[], round: number): HTMLElement {
    const element = document.createElement("div");
    element.className = "group-bracket-wrapper";
    element.classList.add("bracket");

    for (var i = 0; i < matches.length; i++){
        if (matches[i].roundNumber == round){
            element.appendChild(getGroupStyleMatchElement(matches[i]));
        }
    }

    return element;
}

function getRoundRobinElement(matches: Match[], round: number): HTMLElement {
    const element = document.createElement("div");
    element.className = "roundrobin-bracket-wrapper";
    element.classList.add("bracket");

    const groups = Array.apply(null, Array(matches[matches.length-1].group)).map(function () { return [] });

    for (var i = 0; i < matches.length; i++){
        if (matches[i].roundNumber == round){
            groups[matches[i].group-1].push(getGroupStyleMatchElement(matches[i]));
        }
    }

    for (var i = 0; i < groups.length; i++){
        const groupElim = document.createElement("div");
        groupElim.className = "group-bracket-wrapper";
        groupElim.classList.add("bracket");

        const header = document.createElement("div")
        header.className = "group-header";
        header.innerText = "Group " + String.fromCharCode(65 + i);;
        groupElim.appendChild(header);

        for (var j = 0; j < groups[i].length; j++){
            groupElim.appendChild(groups[i][j]);
        }

        element.appendChild(groupElim);
    }

    return element;
}

function getGroupStyleMatchElement(match: Match): HTMLElement {
    const element = document.createElement("div");
    element.className = "group-round-wrapper";

    if (match.topWinner || match.bottomWinner){
        element.dataset.roundStatus = "finished";
    } else if (match.topName !== undefined || match.bottomName !== undefined){
        element.dataset.roundStatus = "in-progress"
    } else {
        element.dataset.roundStatus = "not-started";
    }

    element.dataset.matchId = match.id;

    const topTeam = document.createElement("div");
    topTeam.className = "team-wrapper top";

    if (match.topWinner){
        topTeam.classList.add("winner");
    }
    
    const topName = document.createElement("div");
    topName.className = "team";
    topName.innerText = match.topName !== undefined ? getLimitedName(match.topName) : "-";

    const topScore = document.createElement("div");
    topScore.className = "score";
    topScore.innerText = match.topScore !== undefined ? match.topScore.toString() : "-";

    topTeam.appendChild(topName);
    topTeam.appendChild(topScore);

    const bottomTeam = document.createElement("div");
    bottomTeam.className = "team-wrapper bottom";

    if (match.bottomWinner) {
        bottomTeam.classList.add("winner");
    }

    const bottomName = document.createElement("div");
    bottomName.className = "team";
    bottomName.innerText = match.bottomName !== undefined ? getLimitedName(match.bottomName) : "-";

    const bottomScore = document.createElement("div");
    bottomScore.className = "score";
    bottomScore.innerText = match.bottomScore !== undefined ? match.bottomScore.toString() : "-";

    bottomTeam.appendChild(bottomName);
    bottomTeam.appendChild(bottomScore);

    element.appendChild(topTeam);
    element.appendChild(bottomTeam);

    return element;
}

function getLimitedName(name: string, len: number = 22): string{
    if (name === undefined){
        return "-";
    }
    if (name.length > len){
        return name.substring(0, len).trim() + "...";    
    }
    return name;
}