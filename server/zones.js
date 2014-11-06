var Zones = {
	City: {
		Rooms: [
			{
				id: 'r0',
				name: 'Market Square',
				description: '',
				exits: { e: 'r1', w: 'r2' },
				items: [ 'i0' ],
				mobs: [ 'm0' ]
			},
			{
				id: 'r1',
				name: 'Market Street',
				description: '',
				exits: { w: 'r0' },
				items: [ 'i1' ],
				mobs: [ 'm1' ]
			},
			{
				id: 'r2',
				name: 'Market Street',
				description: '',
				exits: { e: 'r0' },
				items: [ 'i2' ],
				mobs: [ 'm2' ]
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
			}
		},
		Mobs: {
			m0: {
				name: 'Guard',
				hp: 10
			},
			m1: {
				name: 'Peasant',
				hp: 4
			},
			m2: {
				name: 'Dog',
				hp: 1
			}
		}
	}
};

module.exports = Zones;