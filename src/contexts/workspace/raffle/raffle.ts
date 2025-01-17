export type Raffle = {
    version: '0.1.0';
    name: 'raffle';
    instructions: [
        {
            name: 'initialize';
            accounts: [
                {
                    name: 'admin';
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: 'globalAuthority';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'systemProgram';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'rent';
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: 'globalBump';
                    type: 'u8';
                },
                {
                    name: 'globalName';
                    type: 'string';
                }
            ];
            returns: null;
        },
        {
            name: 'createRaffle';
            accounts: [
                {
                    name: 'admin';
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: 'globalAuthority';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'raffle';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'ownerTempNftAccount';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'destNftTokenAccount';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'nftMintAddress';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'tokenProgram';
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: 'ticketPricePrey';
                    type: 'u64';
                },
                {
                    name: 'ticketPriceSol';
                    type: 'u64';
                },
                {
                    name: 'endTimestamp';
                    type: 'i64';
                },
                {
                    name: 'winnerCount';
                    type: 'u64';
                },
                {
                    name: 'rewardAmount';
                    type: 'u64';
                },
                {
                    name: 'whitelisted';
                    type: 'u64';
                },
                {
                    name: 'maxEntrants';
                    type: 'u64';
                },
                {
                    name: 'splTokenAddress';
                    type: 'publicKey';
                }
            ];
            returns: null;
        },
        {
            name: 'buyTickets';
            accounts: [
                {
                    name: 'buyer';
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: 'raffle';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'globalAuthority';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'creator';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'userTokenAccount';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'tokenMint';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'tokenProgram';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'systemProgram';
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: 'amount';
                    type: 'u64';
                }
            ];
            returns: null;
        },
        {
            name: 'revealWinner';
            accounts: [
                {
                    name: 'buyer';
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: 'raffle';
                    isMut: true;
                    isSigner: false;
                }
            ];
            args: [];
            returns: null;
        },
        {
            name: 'claimReward';
            accounts: [
                {
                    name: 'claimer';
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: 'globalAuthority';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'raffle';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'claimerNftTokenAccount';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'srcNftTokenAccount';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'srcPreyTokenAccount';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'claimerPreyTokenAccount';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'nftMintAddress';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'tokenProgram';
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [];
            returns: null;
        },
        {
            name: 'withdrawNft';
            accounts: [
                {
                    name: 'claimer';
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: 'globalAuthority';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'raffle';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'claimerNftTokenAccount';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'srcNftTokenAccount';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'nftMintAddress';
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: 'tokenProgram';
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [];
            returns: null;
        },
        {
            name: 'close';
            accounts: [
                {
                    name: 'payer';
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: 'raffle';
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: 'systemProgram';
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [];
            returns: null;
        }
    ];
    accounts: [
        {
            name: 'globalPool';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'superAdmin';
                        type: 'publicKey';
                    },
                    {
                        name: 'globalBump';
                        type: 'u8';
                    },
                    {
                        name: 'globalName';
                        type: 'string';
                    }
                ];
            };
        },
        {
            name: 'rafflePool';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'creator';
                        type: 'publicKey';
                    },
                    {
                        name: 'nftMint';
                        type: 'publicKey';
                    },
                    {
                        name: 'splTokenAddress';
                        type: 'publicKey';
                    },
                    {
                        name: 'count';
                        type: 'u64';
                    },
                    {
                        name: 'winnerCount';
                        type: 'u64';
                    },
                    {
                        name: 'noRepeat';
                        type: 'u64';
                    },
                    {
                        name: 'maxEntrants';
                        type: 'u64';
                    },
                    {
                        name: 'endTimestamp';
                        type: 'i64';
                    },
                    {
                        name: 'ticketPricePrey';
                        type: 'u64';
                    },
                    {
                        name: 'ticketPriceSol';
                        type: 'u64';
                    },
                    {
                        name: 'rewardAmount';
                        type: 'u64';
                    },
                    {
                        name: 'whitelisted';
                        type: 'u64';
                    },
                    {
                        name: 'claimedWinner';
                        type: {
                            array: ['u64', 50];
                        };
                    },
                    {
                        name: 'indexes';
                        type: {
                            array: ['u64', 50];
                        };
                    },
                    {
                        name: 'winner';
                        type: {
                            array: ['publicKey', 50];
                        };
                    },
                    {
                        name: 'entrants';
                        type: {
                            array: ['publicKey', 5000];
                        };
                    }
                ];
            };
        }
    ];
    errors: [
        {
            code: 6000;
            name: 'MaxEntrantsTooLarge';
            msg: 'Max entrants is too large';
        },
        {
            code: 6001;
            name: 'RaffleEnded';
            msg: 'Raffle has ended';
        },
        {
            code: 6002;
            name: 'NotREAPToken';
            msg: 'Your Token is not REAP Token';
        },
        {
            code: 6003;
            name: 'RaffleNotEnded';
            msg: 'Raffle has not ended';
        },
        {
            code: 6004;
            name: 'InvalidPrizeIndex';
            msg: 'Invalid prize index';
        },
        {
            code: 6005;
            name: 'EndTimeError';
            msg: 'Invalid new End time';
        },
        {
            code: 6006;
            name: 'NoPrize';
            msg: 'No prize';
        },
        {
            code: 6007;
            name: 'NotCreator';
            msg: 'You are not the Creator';
        },
        {
            code: 6008;
            name: 'NotWinner';
            msg: 'You are not the Winnner';
        },
        {
            code: 6009;
            name: 'OtherEntrants';
            msg: 'There are other Entrants';
        },
        {
            code: 6010;
            name: 'InvalidCalculation';
            msg: 'Invalid calculation';
        },
        {
            code: 6011;
            name: 'NotEnoughToken';
            msg: "You don't have enough token";
        },
        {
            code: 6012;
            name: 'NotEnoughSOL';
            msg: "You don't have enough SOL";
        },
        {
            code: 6013;
            name: 'NotEnoughTicketsLeft';
            msg: 'Not enough tickets left';
        },
        {
            code: 6014;
            name: 'RaffleStillRunning';
            msg: 'Raffle is still running';
        },
        {
            code: 6015;
            name: 'WinnersAlreadyDrawn';
            msg: 'Winner already drawn';
        },
        {
            code: 6016;
            name: 'WinnerNotDrawn';
            msg: 'Winner not drawn';
        },
        {
            code: 6017;
            name: 'InvalidRevealedData';
            msg: 'Invalid revealed data';
        },
        {
            code: 6018;
            name: 'TokenAccountNotOwnedByWinner';
            msg: 'Ticket account not owned by winner';
        },
        {
            code: 6019;
            name: 'TicketHasNotWon';
            msg: 'Ticket has not won';
        },
        {
            code: 6020;
            name: 'UnclaimedPrizes';
            msg: 'Unclaimed prizes';
        },
        {
            code: 6021;
            name: 'InvalidRecentBlockhashes';
            msg: 'Invalid recent blockhashes';
        }
    ];
};

export const IDL: Raffle = {
    version: '0.1.0',
    name: 'raffle',
    instructions: [
        {
            name: 'initialize',
            accounts: [
                {
                    name: 'admin',
                    isMut: true,
                    isSigner: true
                },
                {
                    name: 'globalAuthority',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'rent',
                    isMut: false,
                    isSigner: false
                }
            ],
            args: [
                {
                    name: 'globalBump',
                    type: 'u8'
                },
                {
                    name: 'globalName',
                    type: 'string'
                }
            ],
            returns: null
        },
        {
            name: 'createRaffle',
            accounts: [
                {
                    name: 'admin',
                    isMut: true,
                    isSigner: true
                },
                {
                    name: 'globalAuthority',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'raffle',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'ownerTempNftAccount',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'destNftTokenAccount',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'nftMintAddress',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'tokenProgram',
                    isMut: false,
                    isSigner: false
                }
            ],
            args: [
                {
                    name: 'ticketPricePrey',
                    type: 'u64'
                },
                {
                    name: 'ticketPriceSol',
                    type: 'u64'
                },
                {
                    name: 'endTimestamp',
                    type: 'i64'
                },
                {
                    name: 'winnerCount',
                    type: 'u64'
                },
                {
                    name: 'rewardAmount',
                    type: 'u64'
                },
                {
                    name: 'whitelisted',
                    type: 'u64'
                },
                {
                    name: 'maxEntrants',
                    type: 'u64'
                },
                {
                    name: 'splTokenAddress',
                    type: 'publicKey'
                }
            ],
            returns: null
        },
        {
            name: 'buyTickets',
            accounts: [
                {
                    name: 'buyer',
                    isMut: true,
                    isSigner: true
                },
                {
                    name: 'raffle',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'globalAuthority',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'creator',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'userTokenAccount',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'tokenMint',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'tokenProgram',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false
                }
            ],
            args: [
                {
                    name: 'amount',
                    type: 'u64'
                }
            ],
            returns: null
        },
        {
            name: 'revealWinner',
            accounts: [
                {
                    name: 'buyer',
                    isMut: true,
                    isSigner: true
                },
                {
                    name: 'raffle',
                    isMut: true,
                    isSigner: false
                }
            ],
            args: [],
            returns: null
        },
        {
            name: 'claimReward',
            accounts: [
                {
                    name: 'claimer',
                    isMut: true,
                    isSigner: true
                },
                {
                    name: 'globalAuthority',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'raffle',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'claimerNftTokenAccount',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'srcNftTokenAccount',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'srcPreyTokenAccount',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'claimerPreyTokenAccount',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'nftMintAddress',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'tokenProgram',
                    isMut: false,
                    isSigner: false
                }
            ],
            args: [],
            returns: null
        },
        {
            name: 'withdrawNft',
            accounts: [
                {
                    name: 'claimer',
                    isMut: true,
                    isSigner: true
                },
                {
                    name: 'globalAuthority',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'raffle',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'claimerNftTokenAccount',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'srcNftTokenAccount',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'nftMintAddress',
                    isMut: false,
                    isSigner: false
                },
                {
                    name: 'tokenProgram',
                    isMut: false,
                    isSigner: false
                }
            ],
            args: [],
            returns: null
        },
        {
            name: 'close',
            accounts: [
                {
                    name: 'payer',
                    isMut: true,
                    isSigner: true
                },
                {
                    name: 'raffle',
                    isMut: true,
                    isSigner: false
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false
                }
            ],
            args: [],
            returns: null
        }
    ],
    accounts: [
        {
            name: 'globalPool',
            type: {
                kind: 'struct',
                fields: [
                    {
                        name: 'superAdmin',
                        type: 'publicKey'
                    },
                    {
                        name: 'globalBump',
                        type: 'u8'
                    },
                    {
                        name: 'globalName',
                        type: 'string'
                    }
                ]
            }
        },
        {
            name: 'rafflePool',
            type: {
                kind: 'struct',
                fields: [
                    {
                        name: 'creator',
                        type: 'publicKey'
                    },
                    {
                        name: 'nftMint',
                        type: 'publicKey'
                    },
                    {
                        name: 'splTokenAddress',
                        type: 'publicKey'
                    },
                    {
                        name: 'count',
                        type: 'u64'
                    },
                    {
                        name: 'winnerCount',
                        type: 'u64'
                    },
                    {
                        name: 'noRepeat',
                        type: 'u64'
                    },
                    {
                        name: 'maxEntrants',
                        type: 'u64'
                    },
                    {
                        name: 'endTimestamp',
                        type: 'i64'
                    },
                    {
                        name: 'ticketPricePrey',
                        type: 'u64'
                    },
                    {
                        name: 'ticketPriceSol',
                        type: 'u64'
                    },
                    {
                        name: 'rewardAmount',
                        type: 'u64'
                    },
                    {
                        name: 'whitelisted',
                        type: 'u64'
                    },
                    {
                        name: 'claimedWinner',
                        type: {
                            array: ['u64', 50]
                        }
                    },
                    {
                        name: 'indexes',
                        type: {
                            array: ['u64', 50]
                        }
                    },
                    {
                        name: 'winner',
                        type: {
                            array: ['publicKey', 50]
                        }
                    },
                    {
                        name: 'entrants',
                        type: {
                            array: ['publicKey', 5000]
                        }
                    }
                ]
            }
        }
    ],
    errors: [
        {
            code: 6000,
            name: 'MaxEntrantsTooLarge',
            msg: 'Max entrants is too large'
        },
        {
            code: 6001,
            name: 'RaffleEnded',
            msg: 'Raffle has ended'
        },
        {
            code: 6002,
            name: 'NotREAPToken',
            msg: 'Your Token is not REAP Token'
        },
        {
            code: 6003,
            name: 'RaffleNotEnded',
            msg: 'Raffle has not ended'
        },
        {
            code: 6004,
            name: 'InvalidPrizeIndex',
            msg: 'Invalid prize index'
        },
        {
            code: 6005,
            name: 'EndTimeError',
            msg: 'Invalid new End time'
        },
        {
            code: 6006,
            name: 'NoPrize',
            msg: 'No prize'
        },
        {
            code: 6007,
            name: 'NotCreator',
            msg: 'You are not the Creator'
        },
        {
            code: 6008,
            name: 'NotWinner',
            msg: 'You are not the Winnner'
        },
        {
            code: 6009,
            name: 'OtherEntrants',
            msg: 'There are other Entrants'
        },
        {
            code: 6010,
            name: 'InvalidCalculation',
            msg: 'Invalid calculation'
        },
        {
            code: 6011,
            name: 'NotEnoughToken',
            msg: "You don't have enough token"
        },
        {
            code: 6012,
            name: 'NotEnoughSOL',
            msg: "You don't have enough SOL"
        },
        {
            code: 6013,
            name: 'NotEnoughTicketsLeft',
            msg: 'Not enough tickets left'
        },
        {
            code: 6014,
            name: 'RaffleStillRunning',
            msg: 'Raffle is still running'
        },
        {
            code: 6015,
            name: 'WinnersAlreadyDrawn',
            msg: 'Winner already drawn'
        },
        {
            code: 6016,
            name: 'WinnerNotDrawn',
            msg: 'Winner not drawn'
        },
        {
            code: 6017,
            name: 'InvalidRevealedData',
            msg: 'Invalid revealed data'
        },
        {
            code: 6018,
            name: 'TokenAccountNotOwnedByWinner',
            msg: 'Ticket account not owned by winner'
        },
        {
            code: 6019,
            name: 'TicketHasNotWon',
            msg: 'Ticket has not won'
        },
        {
            code: 6020,
            name: 'UnclaimedPrizes',
            msg: 'Unclaimed prizes'
        },
        {
            code: 6021,
            name: 'InvalidRecentBlockhashes',
            msg: 'Invalid recent blockhashes'
        }
    ]
};
