async function getMatchesFromBracketID(id: string): Promise<{bracketType, matches, numRounds}> {
    var matches: Match[] = [];
    var bracketType: string;
    var numRounds: number;

    return fetch(`https://api.battlefy.com/stages/${id}`)
    .then((response) => {
        return response.json();
    })
    .then(async function(bracketResponse) {
        if (bracketResponse.bracket.type == "roundrobin"){
            matches = await getRoundRobinMatchesFromResponse(bracketResponse);
            bracketType = bracketResponse.bracket.type;
            numRounds = bracketResponse.bracket.teamsCount - 1;
        }
        else {
            matches = await getElimOrSwissMatches(id);
            if (bracketResponse.bracket.type == "elimination"){
                bracketType = bracketResponse.bracket.style == "single" ? "singleelim" : "doubleelim";
                numRounds = bracketResponse.bracket.roundsCount;
            } else {
                bracketType = bracketResponse.bracket.type;
                numRounds = bracketResponse.bracket.series.length;
            }
        }

        return {
            bracketType: bracketType,
            matches: matches,
            numRounds: numRounds
        };
    });
}

async function getElimOrSwissMatches(id: string): Promise<Match[]> {
    var matches: Match[] = [];

    return fetch(`https://api.battlefy.com/stages/${id}/matches`)
    .then((response) => {
        return response.json();
    })
    .then((bracketResponse) => {
        for (var i = 0; i < bracketResponse.length; i++){

            const game = bracketResponse[i];
            var match: Match = {
                id: game._id,
                topName: game?.top?.team?.name,
                topScore: game?.top?.score,
                topSeed: game?.top?.seedNumber,
                topWinner: game?.top?.winner,
                bottomName: game?.bottom?.team?.name,
                bottomScore: game?.bottom?.score,
                bottomSeed: game?.bottom?.seedNumber,
                bottomWinner: game?.bottom?.winner,
                matchNumber: game.matchNumber,
                roundNumber: game.roundNumber,
                type: game?.matchType
            };

            matches.push(match);
        }

        return matches;
    });
}

async function getRoundRobinMatchesFromResponse(res): Promise<Match[]> {
    var matches: Match[] = [];

    var promises = [];
    for (var i = 0; i < res.groupIDs.length; i++){
        promises.push(fetch(`https://api.battlefy.com/groups/${res.groupIDs[i]}/matches`));
    }

    return Promise.all(promises)
    .then((data) => Promise.all(data.map(data => {
        return data.json();
    })))
    .then((groupResponse) => {
        for (var i = 0; i < groupResponse.length; i++){
            for (var j = 0; j < groupResponse[i].length; j++){
                const game = groupResponse[i][j];
                matches.push({
                    id: game._id,
                    topName: game?.top?.team?.name,
                    topScore: game?.top?.score,
                    topWinner: game?.top?.winner,
                    bottomName: game?.bottom?.team?.name,
                    bottomScore: game?.bottom?.score,
                    bottomSeed: game?.bottom?.seedNumber,
                    bottomWinner: game?.bottom?.winner,
                    matchNumber: game.matchNumber,
                    roundNumber: game.roundNumber,
                    group: i + 1
                });
            }
        }

        return matches;
    });
}