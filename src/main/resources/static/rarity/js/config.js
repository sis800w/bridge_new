$(function(){
	//$.chainId = 97;
	//$.chainName = "Binance Smart Chain - Testnet";
	//$.defRef = "0x27138Ba09E4C25C500630B6892151d17D9426343";
	//$.MAIN_ADDR = "0xF03f858a4b580498d452c8c3E32AB041e860c355";
	//$.MARKET_ADDR = "0x8A76A1f48aD0Aa2C893e2f0AE385f1Fe442aEe98";
	//$.ERC20_ADDR = "0x7E559579392b43F0780803a04967125f16230091";
	
	$.chainId = 250;
	$.chainName = "FANTOM";
	$.defRef = "0x80cBE9FcF20B574db0084c290e215350d5ABd381";
	$.MAIN_ADDR = "0x120d19730824B343C8Df5FCA14E7C7E497058949";
	$.MARKET_ADDR = "0xA254ceb2cc7fB141629EE454f9E7c7b43b088aE9";
	$.ERC20_ADDR = "0xaB563Fd7a01f60d7e2d3a6EE61aA8745Ed41f6cF";
	
	$.MAIN_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"newName","type":"string"}],"name":"NewSummonerName","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"}],"name":"leveled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"class","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"}],"name":"summoned","type":"event"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"adventure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"classes","outputs":[{"internalType":"string","name":"description","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"genders","outputs":[{"internalType":"string","name":"description","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"level_up","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"next_summoner","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"races","outputs":[{"internalType":"string","name":"description","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"},{"internalType":"uint256","name":"_xp","type":"uint256"}],"name":"spend_xp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint256","name":"_race","type":"uint256"},{"internalType":"uint256","name":"_class","type":"uint256"},{"internalType":"uint256","name":"_gender","type":"uint256"},{"internalType":"address","name":"_ref","type":"address"}],"name":"summon","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"summoner","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"summoners","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"class","type":"uint256"},{"internalType":"uint256","name":"race","type":"uint256"},{"internalType":"uint256","name":"gender","type":"uint256"},{"internalType":"uint256","name":"xp","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"adventurers_log","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"string","name":"_name","type":"string"}],"name":"updateSummonerName","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"bool","name":"activated","type":"bool"},{"internalType":"address","name":"ref","type":"address"},{"internalType":"uint256","name":"invitedCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"curent_level","type":"uint256"}],"name":"xp_required","outputs":[{"internalType":"uint256","name":"xp_to_next_level","type":"uint256"}],"stateMutability":"pure","type":"function"}];
	$.MARKET_ABI = [{"inputs":[{"internalType":"contract ERC721","name":"erc721_","type":"address"},{"internalType":"contract ERC20","name":"erc20_","type":"address"},{"internalType":"uint8","name":"fee_","type":"uint8"},{"internalType":"uint256","name":"minPrice_","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"listId","type":"uint256"}],"name":"Bought","type":"event"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"buy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"collectFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"FeeChanged","type":"event"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"list","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"listId","type":"uint256"}],"name":"Listed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minPrice","type":"uint256"}],"name":"MinPriceChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"uint256","name":"fee_","type":"uint256"}],"name":"setFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"minPrice_","type":"uint256"}],"name":"setMinPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"unlist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"listId","type":"uint256"}],"name":"Unlisted","type":"event"},{"inputs":[],"name":"erc20","outputs":[{"internalType":"contract ERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"erc721","outputs":[{"internalType":"contract ERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGoodsAll","outputs":[{"components":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payout","type":"uint256"}],"internalType":"struct MarketNFT.Goods[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"getGoodsByOwner","outputs":[{"components":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payout","type":"uint256"}],"internalType":"struct MarketNFT.Goods[]","name":"result","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"pageIdx","type":"uint256"},{"internalType":"uint256","name":"pageSize","type":"uint256"}],"name":"getGoodsPage","outputs":[{"components":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payout","type":"uint256"}],"internalType":"struct MarketNFT.Goods[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"startIdx","type":"uint256"},{"internalType":"uint256","name":"endIdx","type":"uint256"}],"name":"getGoodsRange","outputs":[{"components":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"payout","type":"uint256"}],"internalType":"struct MarketNFT.Goods[]","name":"result","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"getGoodsSizeByOwner","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"query_summary","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenIds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
});