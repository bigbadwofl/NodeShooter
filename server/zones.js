var Zones = {
	City: {
		Rooms: [{
			id: 'r0',
			name: 'Market Square',
			description: '',
			exits: {
				e: 'r1',
				w: 'r2'
			},
			mobs: [{
				id: 'm0',
				items: ['i0']
			}]
		}, {
			id: 'r1',
			name: 'East Market Street',
			description: '',
			exits: {
				w: 'r0',
				s: 'tavern'
			},
			mobs: [{
				id: 'm3',
				items: ['i3']
			}, {
				id: 'm1'
			}]
		}, {
			id: 'r2',
			name: 'West Market Street',
			description: '',
			exits: {
				e: 'r0'
			},
			mobs: [{
				id: 'm2'
			}, {
				id: 'm4',
				items: ['i1', 'i2', 'i4']
			}]
		}, {
			id: 'r3',
			name: 'Temple',
			description: '',
			exits: {
				s: 'r1'
			}
		}, {
			id: 'tavern',
			name: 'Noisy Tavern',
			description: '',
			exits: {
				n: 'r1'
			},
			mobs: [{
				id: 'm5'
			}]
		}],
		Items: {
			i0: {
				name: 'Sword',
				value: 10,
				slot: '1HWeapon'
			},
			i1: {
				name: 'Mop of Power',
				value: 10,
				slot: '2HWeapon'
			},
			i2: {
				name: 'Stinky Potion',
				value: 5,
				slot: 'Misc'
			},
			i3: {
				name: 'Broom',
				value: 1,
				slot: '2HWeapon'
			},
			i4: {
				name: 'Sack of the Absolute',
				value: 100,
				slot: 'Head'
			}
		},
		Mobs: {
			m0: {
				name: 'City Guard',
				lvl: 5,
				gold: 20
			},
			m1: {
				name: 'Filthy Peasant',
				lvl: 2,
				gold: 1
			},
			m2: {
				name: 'Mangy Dog',
				lvl: 1,
				handler: 'Pee',
				roam: true
			},
			m3: {
				name: 'Janitor',
				lvl: 3,
				handler: 'Clean',
				roam: true,
				gold: 3
			},
			m4: {
				name: 'Krzystov (Shopkeeper)',
				lvl: 10,
				prefix: '',
				shop: 's0'
			},
			m5: {
				name: 'Angry Warrior',
				lvl: 1,
				gold: 1,
				hostile: true
			}
		},
		Shops: {
			s0: {
				name: "Krzystov's Shop",
				priceScale: 1
			}
		}
	}
};

module.exports = Zones;