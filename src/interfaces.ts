interface Match {
    id: string;
    topName?: string;
    topScore?: number;
    topSeed?: number;
    topWinner?: boolean;
    bottomName: string;
    bottomScore: number;
    bottomSeed: number;
    bottomWinner: boolean;
    matchNumber: number;
    roundNumber: number;
    type?: string;
    group?: number;
}