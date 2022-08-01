export interface RPS {
    id: string,
    name: string,
    host: string,
    playerIds: Set<string>,
    choices: Map<string, 'r' | 'p' | 's' | 'x'>,
    scores: Map<string, number>,
    connections: Set<string>,
    fastMode: boolean;
    winnerName?: string
    gameOver: boolean;
    ggScore: number,
    excluded: Set<string>
}

export class RPS implements RPS {
    setChoice(id: string, rps: 'r' | 'p' | 's' | 'x') {
        this.choices.set(id, rps);
    }
    resetChoices() {
        this.choices.clear();
    }
}

export class RPSManager {
    /**
     * Hashes the `playerIds` and `connections` arrays to sets and `choices` and `scores`
     * objects to maps. Used when receiving state messages from the server's RPS manager.
     */
    static hash(rps: RPS): RPS {
        rps.playerIds = new Set(rps.playerIds);
        rps.connections = new Set(rps.connections);
        rps.excluded = new Set(rps.excluded);

        const choices = new Map();
        for (const [key, value] of Object.entries(rps.choices)) {
            choices.set(key, value);
        }
        rps.choices = choices;

        const scores = new Map();
        for (const [key, value] of Object.entries(rps.scores)) {
            console.log('KEY ', key, 'VAL ', value)
            scores.set(key, value);
        }
        rps.scores = scores;

        return rps;
    }
}

export function isInstanceOfRPS(object: Object): object is RPS {
    return 'host' in object;
}

/**
 * Data expected when sending (`Init`,`Action`) and receiving (`Update`,`State`, `Rooms`) `rps` messages.
 */
export type RPSData = {
    Init?: { host: string, players: string[], gg_score: number },
    Action?: { game_id: string, sender_id: string, action: any },
    Update?: { game_id: string, event: Event },
    State?: RPS,
    Rooms?: RPS[]
}
/**
 * Type of event we can receive from the server side RPS manager
 */
export type Event = {
    PlayerConnected?: string,
    FastToggled?: boolean,
    Choices?: [string, 'r' | 'p' | 's' | 'x'][],
    Winner?: string,
    Exclude?: string[],
    GG: string
}

export type RpsResolve = {
    Exclude?: string[],
    Winner?: string,
}