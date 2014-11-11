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
				mobs: [ { id: 'm2', items: [ 'i2' ] } ]
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
			}
		},
		Mobs: {
			m0: {
				name: 'City Guard',
				hp: 10
			},
			m1: {
				name: 'Filthy Peasant',
				hp: 4
			},
			m2: {
				name: 'Mangy Dog',
				hp: 1
			},
			m3: {
				name: 'Janitor',
				hp: 2,
				handler: 'Clean'
			}
		}
	}
};

module.exports = Zones;