function renderInput(config){
	let template = TEMPLATE.input[`${config.typeName}Input`];
	if(template == undefined){
		console.log(config.typeName, config, "not found");
	}
	return new DOMObject(template, config);
}

const AbstractPage = function(main, parent) {
	let object = this;

	object.main = main;
	object.pageID = object.__proto__.constructor.name;
	object.hasParent = false;
	object.home;
	object.extension;
	object.role = [];
	object.permission = [];
	object.permissions = [];
	object.tabs = [];
	object.tabMapper = {};

	object.table = new AbstractTable(this);
	object.form = new AbstractForm(this);
	object.searchForm = new AbstractSearchForm(this);
	object.dialog = new AbstractDialog(this);
	object.view = new AbstractView(this);
	object.tableView = new AbstractTableView(this);
	object.tableForm = new AbstractTableForm(this);
	object.util = new AbstractInputUtil(this);

	object.pageNumber = 1;
	object.limit = 10;
	object.tabTitle;
	object.restURL;

	object.isTabVisible = true;

	if (parent != undefined) {
		object.hasParent = true;
		object.parent = parent;
		object.parentPageID = parent.pageID;
	}
	if (main != undefined) object.main.pageIDDict[object.pageID] = object;

	for (let i in AbstractPage.prototype) {
		object.__proto__[i] = AbstractPage.prototype[i];
	}

	for (let i in AbstractInputUtil.prototype) {
		object.__proto__[i] = AbstractInputUtil.prototype[i];
	}

	this.preload = async function() {
		if (object.restURL != undefined && object.restProtocol == undefined) object.restProtocol = new AbstractProtocol(main, object.restURL);
	}

	this.loadPermissions = function(extension) {
		object.permissions = [];
		for (let i in object.role) {
			if (object.permission.length == 0) object.permission = [PermissionType.READ, PermissionType.WRITE, PermissionType.UPDATE, PermissionType.DROP]
			for (let j in object.permission) {
				if (extension != undefined) {
					object.permissions.push(`${extension}.${object.role[i]}.${PermissionTypeMap[object.permission[j]]}`)
				} else {
					object.permissions.push(`${object.role[i]}.${PermissionTypeMap[object.permission[j]]}`)
				}
				
			}
		}
	}

	this.setParent = function(parent) {
		object.hasParent = true;
		object.parent = parent;
		object.parentPageID = parent.pageID;
	}
	
	this.initMenuEvent = async function(menu) {
		menu.html.onclick = function() {
			console.log('Not Implement');
		}
	}

	this.register = async function() {
	}

	this.initJS = async function() {
	}

	this.prepare = async function() {
	}

	this.getMenu = async function(isSubMenu, label, icon) {
		let object = this;
		object.menu = await CREATE_MENU(object.pageID, label, icon, isSubMenu);
		return object.menu;
	}

	this.renderState = async function(state) {
		await object.preload();
		if (object.restProtocol == undefined) return;
		if (state.state == 'form') await object.renderForm(object.model, {isSetState: false, data: state.data, isView: state.isView});
	}

	this.setPageState = async function(config) {
		if (config == undefined) config = {}
		if (config.isInit == undefined) config.isInit = true;
		object.changeState(config, object.pageID);
	}

	this.changeState = async function(data, url, page = undefined) {
		let object = this;
		if (page != undefined) object = page;
		await PUSH_STATE(object, data, url);
	}

	this.highlightMenu = async function(menu, isSubMenu, hasSubMenu) {
		if (!hasSubMenu) {
			for (let i in main.selectedSubMenu) {
				main.selectedSubMenu[i].classList.remove('highlightMenu');
			}
			main.selectedSubMenu = [];
		}
		if (!isSubMenu) {
			for (let i in main.selectedMenu) {
				main.selectedMenu[i].classList.remove('highlightMenu');
			}
			main.selectedMenu = [];
		}
		menu.classList.add('highlightMenu');
	}

	this.appendButton = async function(config){
		let button = await object.getButton(config);
		object.home.dom.button.append(button);
		return button;
	}

	this.appendTab = function(config) {
		if (object.tabs.length == 0) {
			if (object.isTabVisible) {
				object.tabs.push(
					{
						page: object,
						value: object.pageID,
						label: object.tabTitle ? object.tabTitle:object.title,
						order: '0.0',
					}
				)
				object.tabMapper[object.pageID] = object;
			}
		}
		if (object.tabMapper[config.page.pageID] != undefined) return;
		object.tabs.push(
			{
				page: config.page,
				value: config.page.pageID,
				label: config.label,
				order: config.order,
			}
		)
		object.tabs.sort((a,b) => parseFloat(a.order) - parseFloat(b.order));
		object.tabMapper[config.page.pageID] = config.page;
	}
	
	this.appendTabButton = async function(modelName, config){
		if(config == undefined) config = {};
		let buttons = [];
		if(config.hasFilter) buttons.push({'cssClass': 'filter_button', 'ID': 'filter', 'icon': 'Filter'});
		let tabButton = await object.renderTabButton(buttons);
		if(config.hasFilter){
			tabButton.filter.onclick = async function(){
				await object.page.renderSearchForm(modelName, {data : object.filter});
				// await object.page.renderSearchDialog(modelName, {data : object.filter});
				await object.page.home.dom.filter.toggle();
			}
		}
		return tabButton;
	}
	
	this.getButton = async function(config){
		let button = new DOMObject(TEMPLATE.Button, config);
		return button;
	}

	this.getTabMenu = async function(menus){
		let menuDict = {};
		for(let i in menus){
			let menu = new DOMObject(TEMPLATE.TabMenu, menus[i]);
			menuDict[menus[i].value] = menu;
		}
		return menuDict;
	}
	
	this.renderTabMenu = async function(menus = []){
		let mergedMenu = [];
		if (object.tabs.length > 0) {
			mergedMenu.push(...object.tabs);
		}
		mergedMenu.push(...menus);
		let tabMenu = await object.getTabMenu(mergedMenu);
		object.home.dom.menuList.html('');
		for(let i in tabMenu){
			object.home.dom.menuList.append(tabMenu[i]);
			object.home.dom.menuList[i] = tabMenu[i].dom[i];
			if (object.tabMapper[i] != undefined) {
				await object.initTabMenuEvent(tabMenu[i].dom[i], object.tabMapper[i]);
			}
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.menuList;
	}

	this.renderTabMenuFromTags = async function(tabMenu = []){
		object.home.dom.menuList.html('');
		for(let i in tabMenu){
			object.home.dom.menuList.append(tabMenu[i]);
			object.home.dom.menuList[i] = tabMenu[i].dom[i];
			if (object.tabMapper[i] != undefined) {
				await object.initTabMenuEvent(tabMenu[i].dom[i], object.tabMapper[i]);
			}
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.menuList;
	}

	this.getTabMenuList = async function(menus = []){
		let tabMenuList = []
		let mergedMenu = [];
		if (object.tabs.length > 0) {
			mergedMenu.push(...object.tabs);
		}
		mergedMenu.push(...menus);
		let tabMenu = await object.getTabMenu(mergedMenu);
		for(let i in tabMenu){
			tabMenuList.push(tabMenu[i]);
			if (object.tabMapper[i] != undefined) {
				await object.initTabMenuEvent(tabMenu[i].dom[i], object.tabMapper[i]);
			}
		}
		return tabMenuList;
	}

	this.initTabMenuEvent = async function(tab, page) {
		tab.onclick = async function() {
			let isChangeState = true;
			if (tab.classList.contains('highlightTab')) isChangeState = false;
			SHOW_LOADING_DIALOG(async function() {
				await page.prepare();
				await page.render({isRenderFromTab: true, tabPageID: object.pageID});
				if (isChangeState) await page.setPageState({isRenderFromTab: true, tabPageID: object.pageID});
			});
			
		}
	}
	
	this.getTabButton = async function(buttons){
		let buttonDict = {};
		object.home.dom.buttonList.html('');
		for(let i in buttons){
			buttons[i].svg = (await CREATE_SVG_ICON(buttons[i].icon)).icon;
			let button = new DOMObject(TEMPLATE.TabButton, buttons[i]);
			buttonDict[buttons[i].ID] = button;
		}
		return buttonDict;
	}
	
	this.renderTabButton = async function(buttons, tabButton){
		if(tabButton == undefined) tabButton = await object.getTabButton(buttons);
		for(let i in tabButton){
			object.home.dom.buttonList.append(tabButton[i]);
			object.home.dom.buttonList[i] = tabButton[i].dom[i];
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.buttonList;
	}
	
	this.getTagCard = async function(data){
		data.label = `${data.name} (${data.supplierID.name})`;
		data.SVG = await CREATE_SVG_ICON('Close');
		let tagCard = new DOMObject(await TEMPLATE.TagCard, data);
		return tagCard;
	}

	this.setHighlightTab = async function(classList, tag){
		for(let i in classList){
			if(typeof(classList[i]) == 'object'){
				classList[i].classList.remove('highlightTab');
			}
		}
		tag.classList.add('highlightTab');
	}

	this.getPageNumber = async function() {
		return object.pageNumber;
	}

	this.setPageNumber = async function(pageNumber) {
		object.pageNumber = pageNumber;
	}

	this.getFilter = function(limit = 10) {
		object.limit = limit;
		return {
			pageNumber: object.pageNumber,
			limit: limit,
			data : object.filter
		}
	}
}