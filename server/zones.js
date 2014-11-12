var Zones = {
	City: {
		Rooms: [
			{
				id: 'r0',
				name: 'Market Square',
				description: '',
				exits: { e: 'r1', w: 'r2' },
				items: [ ],
				mobs: [ { id: 'm0', items: [ 'i0' ] } ]
			},
			{
				id: 'r1',
				name: 'Market Street',
				description: '',
				exits: { w: 'r0' },
				items: [ ],
				mobs: [ { id: 'm3', items: [ 'i3' ] }, { id: 'm1', items: [ 'i1' ] } ]
			},
			{
				id: 'r2',
				name: 'Market Street',
				description: '',
				exits: { e: 'r0' },
				items: [ ],
				mobs: [ { id: 'm2', items: [ 'i2' ] }, { id: 'm4', items: [ 'i4' ] } ]
			}
		],
		Items: {
			i0: {
				name: 'Sword'
			},
			i1: {
				name: 'Gauntlets'
			},
			i2: {
				name: 'Potion'
			},
			i3: {
				name: 'Broom of Power'
			},
			i4: {
				name: 'Sack of the Absolute'
			}
		},
		Mobs: {
			m0: {
				name: 'City Guard',
				hp: 5
			},
			m1: {
				name: 'Filthy Peasant',
				hp: 2
			},
			m2: {
				name: 'Mangy Dog',
				hp: 1
			},
			m3: {
				name: 'Janitor',
				hp: 3,
				handler: 'Clean'
			},
			m4: {
				name: 'Krzystov - Master Janitor',
				hp: 10
			}
		}
	}
};

module.exports = Zones;