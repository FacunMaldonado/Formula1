console.clear();

const raceinfo_api = "https://ergast.com/api/f1/current.json";
const list = document.getElementById('body');

// Format Date to read Month DD, YYYY
const formatDate = (dateEntry) => {
	
	const monthLabels = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];
	
	const dateString = `\/Date(${dateEntry})\/`.substr(6);
	const currentTime = new Date(parseInt(dateString));
	const month = currentTime.getMonth();
	const day = ("0" + currentTime.getDate()).slice(-2);
	const year = currentTime.getFullYear();
	const date = monthLabels[month] + ' ' + day + ', ' + year;
	return date;
}

// Empty State
const emptyState = (title,content) => {
	if((list.querySelectorAll('.c-race--hidden').length == list.querySelectorAll('.c-race').length) || list.querySelectorAll('.c-race').length < 1) {
		const newEmptyState = document.createElement('div');
		newEmptyState.classList = 'c-empty-state';
		newEmptyState.innerHTML = `
		<div class="c-empty-state">
				<svg class="c-empty-state__hero" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 223 131" fill="none">
						<g clip-path="url(#clip0)">
								<path d="M159.871 22.368H222.899L200.775 63.2119H137.747L159.871 22.368Z" fill="var(--component-bg)"></path>
								<path d="M20.4116 79.9662H78.5617L58.1501 117.649H0L20.4116 79.9662Z" fill="var(--component-bg)"></path>
								<path d="M27.0326 19.4039H57.8678L47.0442 39.386H16.209L27.0326 19.4039Z" fill="var(--component-bg)"></path>
								<path d="M145.236 79.9662H166.572L159.083 93.7922H137.747L145.236 79.9662Z" fill="var(--component-bg)"></path>
								<path d="M103.703 34.4378C87.1442 25.0993 75.0513 30.9358 65.3628 37.9612L91.153 82.6311C92.2487 73.1218 93.4287 68.718 102.415 62.9569C111.402 57.1957 122.749 70.4022 136.328 59.6992C147.191 51.1368 145.423 32.304 143.182 23.9578C132.612 40.3685 120.262 43.7762 103.703 34.4378Z" stroke="var(--heading-text-color)" stroke-width="6" stroke-linejoin="round"></path>
								<path d="M71.6864 48.9139L107.58 111.083" stroke="var(--heading-text-color)" stroke-width="6" stroke-linecap="round"></path>
								<circle cx="58.7485" cy="27.1923" r="5.67786" transform="rotate(-30 58.7485 27.1923)" fill="var(--heading-text-color)"></circle>
						</g>
						<defs>
								<clippath id="clip0">
										<rect width="223" height="131" fill="white"></rect>
								</clippath>
						</defs>
				</svg>
				<h4 class="c-empty-state__title">${title}</h4>
				<p>${content}</p>
		</div>
		`;
		list.appendChild(newEmptyState);
	} else {
			list.querySelectorAll('.c-empty-state').forEach(item => {
				item.remove();
			})
	}
}

// Hide non-selected list items when clicking their respective tab item

const allActive = () => {
	list.querySelectorAll('.c-race.c-race--hidden').forEach(hiddenItem => {
		hiddenItem.classList.remove('c-race--hidden');
	})
}

const upcomingActive = () => {
	allActive();
	list.querySelectorAll('.c-race.c-race--inactive').forEach(pastItem => {
		pastItem.classList.add('c-race--hidden');
	})
	emptyState('No upcoming races this season', 'All races this season appear to be finished. Tune in next season!');
}

const pastActive = () => {
	allActive();
	list.querySelectorAll('.c-race.c-race--active').forEach(upcomingItem => {
		upcomingItem.classList.add('c-race--hidden');
	})
	emptyState('No finished races this season', 'No races have started yet. Tune in to the next upcoming race!');
}

const toggleInactiveStyles = (x) => {
	if(x == true) {
		list.querySelectorAll('.c-race.c-race--inactive').forEach(pastItem => {
			pastItem.style.opacity = '.32';
			pastItem.style.boxShadow = '0px 2px 2px 0px rgba(0,0,0,.1)';
		})
	} else {
		list.querySelectorAll('.c-race.c-race--inactive').forEach(pastItem => {
			pastItem.style.opacity = '1';
			pastItem.style.removeProperty('box-shadow');
		})
	}
}

// Function for loading season from ergast api url parameter
const renderRaces = (URL) => {

	// Get data from Ergast Developer API http://ergast.com/mrd/
	$.ajax({
		type: "GET",
		url: URL,
		dataType: "json",
		cache: false,
		success: function(data) {

			const dataTarget = data.MRData.RaceTable.Races;

			// List of offsets between race date and current date 
			const raceDateOffsets = [];

			// Find the lowest offset (soonest race)
			Array.min = function( array ){
				return Math.min.apply( Math, array );
			};

			// Create array of offsets for all future races in the season
			dataTarget.forEach(race => {
				const currentDate = Date.parse(new Date());
				const raceDate = Date.parse(race.date);
				const closestRaceVal = currentDate - raceDate;
				if(closestRaceVal < 0) {
					raceDateOffsets.push(closestRaceVal * -1);
				}
			})

			const closestRaceDate = Array.min(raceDateOffsets);
			// Find local timezone and shorten
			const zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]

			// Loop through season object to create races
			dataTarget.forEach(race => {
				const newRow = document.createElement('li');
				const currentDate = Date.parse(new Date());
				const raceDate = Date.parse(race.date);
				const closestRaceVal = currentDate - raceDate;
				newRow.classList = `c-list__item c-race ${currentDate > raceDate ? 'c-race--inactive' : 'c-race--active'}`;
				
				const dateTimeString = moment(race.date + 'T' + race.time);
				newRow.style.animationDelay = `calc(${race.round} * 100ms)`;

				newRow.innerHTML = `
				<div class="c-race__round">${race.round - 1}</div>
				<div class="c-race__content">
				<h4 class="c-race__title">${race.raceName}</h4>
				<div class="c-race__date">${formatDate(raceDate)} • ${dateTimeString.format('LT')} ${zone}</div>
				<div class="c-race__track">${race.Circuit.circuitName}</div>
				</div>
				`;

				list.appendChild(newRow)
				
				// dynamic background image overlays for next race card
				const bgImages = [
					'https://images.unsplash.com/photo-1530525555924-ea911cdf2a2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1778&q=80',
					'http://ea80e97cace747c2c244-5483548c70a81fe49af7816b21fff1c8.r64.cf1.rackcdn.com/_800x350_strech_top-center_100/Thank-You-F1.jpg',
					'https://images.unsplash.com/photo-1531328418211-f43ca4910bbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2389&q=80',
					'https://s3-eu-west-1.amazonaws.com/crash.net/styles/article/s3/field/image/AP-1VJFP92391W11_hires_jpeg_24bit_rgb.jpg?itok=xyMKUKOk',
				];

				// Get data of next race

				if(closestRaceDate == closestRaceVal * -1) {
					if(raceDateOffsets.length > 0) {
						const newTitle = document.createElement('h6');
						newTitle.innerHTML = 'Next Race:';
						document.querySelector('.c-latest').appendChild(newTitle);
					}
					const randomBgImage = Math.floor(Math.random() * Math.floor(bgImages.length));
					const latestItem = document.createElement('div');
					latestItem.classList = 'c-race c-latest__item';
					const dateTimeString = moment(race.date + 'T' + race.time);
					latestItem.innerHTML = `
					<div class="c-latest__background" style="background-image:url(${bgImages[randomBgImage]})"></div>
					<div class="c-race__round">${race.round}</div>
					<div class="c-race__content">
					<h4 class="c-race__title">${race.raceName}</h4>
					<div class="c-race__date">${formatDate(raceDate)} • ${dateTimeString.format('LT')} ${zone}</div>
					<div class="c-race__track">${race.Circuit.circuitName}</div>
					</div>
					`;
					document.querySelector('.c-latest').appendChild(latestItem);
				}
			})

			// Auto filter to only upcoming races
			upcomingActive();
		}
	});

}

// Run current season
renderRaces(raceinfo_api);

const changeSeason = document.getElementById('changeSeason');

// Change season on select event
changeSeason.addEventListener('change', function(e) {
	document.querySelector('.c-latest').innerHTML = '';
	// Create loading state inbetween API call
	document.getElementById('body').innerHTML = `
		<svg class="c-loader" viewBox="25 25 50 50" stroke="currentColor">
			<circle cx="50" cy="50" r="20"></circle>
		</svg>
		<h5 class="u-text--center">Loading races for the ${e.target.value} season...</h5>
	`;
	const changeURL = `https://ergast.com/api/f1/${e.target.value}.json`;
	// remove empty state and run API call for season
	setTimeout(() => {
		document.getElementById('body').innerHTML = '';
		renderRaces(changeURL);
	}, 1000)
}) 

// list fade animation
const fadeList = () => {
	list.style.transition = 'all 0s';
	list.style.opacity = 0;
	setTimeout(() => {
		list.style.transition = 'all 300ms ease-out 0s';
		list.style.opacity = 1;
	}, 220)
}

const tabItems = document.querySelectorAll('.c-tab-bar__item');

// Add click events and filter to each tab item
tabItems.forEach(tab => {
	tab.addEventListener('click', () => {
		if(!tab.classList.contains('c-tab-bar__item--active')) {
			tab.parentNode.querySelector('.c-tab-bar__item--active')
				.classList.remove('c-tab-bar__item--active');
			tab.classList.add('c-tab-bar__item--active');
			
			fadeList();
			
			const eventType = tab.dataset.event;
			
			switch (eventType) {
				case 'upcoming':
					upcomingActive();
					toggleInactiveStyles(false);
					break;
				case 'past':
					pastActive();
					toggleInactiveStyles(false);
					break;
				case 'all':
					allActive();
					toggleInactiveStyles(true);
					break;
			}
			
		} else {
			// Do nothing if clicked tab item is already active
		}
	})
});

// dark theming for the true homies
// colors controlled by utility css variables bound to root element and class

const themeButton = document.getElementById('themeChange');

themeButton.addEventListener('click', () => {
	if(document.documentElement.classList.contains('theme--dark')) {
		document.documentElement.classList.remove('theme--dark');
		themeButton.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="12" cy="12" r="5"></circle>
				<line x1="12" y1="1" x2="12" y2="3"></line>
				<line x1="12" y1="21" x2="12" y2="23"></line>
				<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
				<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
				<line x1="1" y1="12" x2="3" y2="12"></line>
				<line x1="21" y1="12" x2="23" y2="12"></line>
				<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
				<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
			</svg>
		`;
	} else {
		document.documentElement.classList.add('theme--dark');
		themeButton.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
		`;
	}
});