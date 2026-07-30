import { db, runMigrations } from './index'
import { games, players } from './schema'

runMigrations()

const PLAYERS = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Charlie' },
  { name: 'Diana' },
  { name: 'Ethan' },
  { name: 'Fiona' },
  { name: 'George' },
  { name: 'Hannah' },
  { name: 'Ivan' },
  { name: 'Julia' },
  { name: 'Kevin' },
  { name: 'Laura' },
  { name: 'Marcus' },
  { name: 'Nina' },
  { name: 'Oscar' },
  { name: 'Petra' },
  { name: 'Quinn' },
  { name: 'Rosa' },
  { name: 'Sam' },
  { name: 'Tara' },
]

const insertedPlayers = db.insert(players).values(PLAYERS).returning().all()
console.log(`Seeded ${insertedPlayers.length} players.`)

const GAMES = [
  { name: 'Catan', description: 'Trade, build, and settle the island of Catan.', min_players: 3, max_players: 4, year_published: 1995, bgg_id: 13 },
  { name: 'Ticket to Ride', description: 'Claim railway routes across the country.', min_players: 2, max_players: 5, year_published: 2004, bgg_id: 9209 },
  { name: 'Pandemic', description: 'Work together to stop four diseases from spreading.', min_players: 2, max_players: 4, year_published: 2008, bgg_id: 30549 },
  { name: 'Dominion', description: 'Build your deck from a shared supply of cards.', min_players: 2, max_players: 4, year_published: 2008, bgg_id: 36218 },
  { name: 'Codenames', description: 'Give one-word clues to help your team identify agents.', min_players: 2, max_players: 8, year_published: 2015, bgg_id: 178900 },
  { name: 'Splendor', description: 'Collect gems and build a renaissance gem trade empire.', min_players: 2, max_players: 4, year_published: 2014, bgg_id: 148228 },
  { name: '7 Wonders', description: 'Lead an ancient civilization through three ages.', min_players: 2, max_players: 7, year_published: 2010, bgg_id: 68448 },
  { name: 'Wingspan', description: 'Attract birds to your wildlife preserve.', min_players: 1, max_players: 5, year_published: 2019, bgg_id: 266192 },
  { name: 'Azul', description: 'Draft colorful tiles to decorate the royal palace.', min_players: 2, max_players: 4, year_published: 2017, bgg_id: 230802 },
  { name: 'Terraforming Mars', description: 'Compete to make Mars habitable.', min_players: 1, max_players: 5, year_published: 2016, bgg_id: 167791 },
  { name: 'Agricola', description: 'Manage a farm and feed your family.', min_players: 1, max_players: 5, year_published: 2007, bgg_id: 31260 },
  { name: 'Carcassonne', description: 'Build the medieval landscape tile by tile.', min_players: 2, max_players: 5, year_published: 2000, bgg_id: 822 },
  { name: 'Power Grid', description: 'Supply electricity to the most cities.', min_players: 2, max_players: 6, year_published: 2004, bgg_id: 2651 },
  { name: 'Puerto Rico', description: 'Produce and ship goods from your colonial plantation.', min_players: 2, max_players: 5, year_published: 2002, bgg_id: 3076 },
  { name: 'Viticulture', description: 'Build a thriving winery in rustic Tuscany.', min_players: 1, max_players: 6, year_published: 2013, bgg_id: 128621 },
  { name: 'Everdell', description: 'Build a city of critters and constructions in a forest valley.', min_players: 1, max_players: 4, year_published: 2018, bgg_id: 199792 },
  {
    name: 'Lost Ruins of Arnak',
    description: 'Explore an island, fight guardians, and unlock ancient mysteries.',
    min_players: 1,
    max_players: 4,
    year_published: 2020,
    bgg_id: 312484,
  },
  { name: 'Spirit Island', description: 'Cooperative spirits defend an island from colonizers.', min_players: 1, max_players: 4, year_published: 2017, bgg_id: 162886 },
  { name: 'Scythe', description: 'Alternate-history 1920s Europe — engine build and area control.', min_players: 1, max_players: 5, year_published: 2016, bgg_id: 169786 },
  { name: 'Root', description: 'Asymmetric factions vie for control of a woodland.', min_players: 2, max_players: 4, year_published: 2018, bgg_id: 237182 },
]

const inserted = db.insert(games).values(GAMES).returning().all()
console.log(`Seeded ${inserted.length} games.`)
