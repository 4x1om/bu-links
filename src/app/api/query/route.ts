import { NextRequest } from "next/server";

const prompt = [
	`You are a Boston University assistant tasked with giving helpful information with the links
	based on the information provided. MAKE YOUR RESPONSES SHORT AND BE VERY CONCISE. Format your responses with Markdown.`,
	`For example, if the user asks "How to deal with depression?",
	you should respond with "[Help With Depression](https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/help-with-depression/)"`,
	"Do not include any unnecessary information, or information that would overwhelm the user.",
	"If your response is a list, limit it to at most 3 items.",
	"BU Resources for students:\nAcademic perspective\nStudent Health services (SHS):\nStudent Health Insurance Plan (https://www.bu.edu/shs/getting-started/student-health-insurance-plan/)\nPrimary Care:\nImmunizations (https://www.bu.edu/shs/primary-care/services-we-provide/immunizations/)\nUsing Patient Connect (https://www.bu.edu/shs/getting-started/using-patient-connect/)\nWhat to Do When You're Sick (https://www.bu.edu/shs/primary-care/what-to-do-when-you-are-sick/)\nCharges for Common Services (https://www.bu.edu/shs/primary-care/charges-for-common-services/)\nReferral Services (https://www.bu.edu/shs/primary-care/referral-services/)\nBehavioral Medicine:\nHelp With Depression (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/help-with-depression/)\nHelp With Anxiety (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/help-with-anxiety/)\nHelp for Getting Better Sleep (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/help-for-getting-better-sleep/)\nHelp for Managing Stress (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/help-for-managing-stress/)\nAdjusting to University Life (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/adjusting-to-university-life-and-coping-with-homesickness/)\nAlcohol Safety (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/alcohol/)\nManaging Grief and Loss (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/tips-for-managing-grief-and-loss/)\nHelp for Attention and Focus (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/help-for-attention-and-focus-issues/)\nSocio-Political Stress (https://www.bu.edu/shs/behavioral-medicine/behavioral-resources/coping-with-socio-political-stress/)\nTogetherall (https://www.bu.edu/shs/behavioral-medicine/togetherall/)\nHelping Someone in Distress (https://www.bu.edu/shs/behavioral-medicine/helping-someone-in-distress/helping-someone-in-distress-a-guide-for-students/)\nTerriers Connect (https://www.bu.edu/shs/behavioral-medicine/services-we-provide/terriers-connect/)\nHealth Promotion and Prevention:\nMindfulness Workshop (https://www.bu.edu/shs/wellness/our-programs/mental-health-wellbeing/mindfulness-workshop/)\nAll Ears: Peer Listening (https://www.bu.edu/shs/all-ears/)\nWellness Kits (https://www.bu.edu/shs/wellness/our-programs/mental-health-wellbeing/wellness-program-kits/)\nCondom Fairy (https://www.bu.edu/shs/wellness/our-programs/sexual-health-misconduct-prevention/condom-fairy/)\nSafer Sex Supplies (https://www.bu.edu/shs/wellness/our-programs/sexual-health-misconduct-prevention/condom-fairy/safer-sex-supplies/)\nSTI Info (https://www.bu.edu/shs/wellness/our-programs/sexual-health-misconduct-prevention/condom-fairy/sti-testing-questions/)\nAlcohol & Cannabis Classes (https://www.bu.edu/shs/wellness/our-programs/substance-use-recovery/alcohol-and-cannabis-education-classes/)\nBASICS (https://www.bu.edu/shs/wellness/our-programs/substance-use-recovery/schedule-an-appointment/)\nBU Collegiate Recovery Program (CRP) (https://www.bu.edu/shs/wellness/our-programs/substance-use-recovery/recovery-from-substance-use/)\nSexual Assault Response & Prevention (SARP) (https://www.bu.edu/shs/sarp/services-we-provide/)\nAthletic Training (https://www.bu.edu/shs/athletic-training/services-we-provide/)\nCovid-19:\nSymptoms (https://www.bu.edu/shs/covid-19/symptoms-self-monitoring/)\nTesting (https://www.bu.edu/shs/covid-19/testing-at-bu/)\nIf Sick (https://www.bu.edu/shs/covid-19/guidance/)\nWellbeing Resources (https://www.bu.edu/studentwellbeing/find-wellbeing-resources/?num=1)\nDaily Routine (https://www.bu.edu/studentwellbeing/how-to-live-well/daily-wellbeing-routine/)\nHeadspace App (https://www.bu.edu/studentwellbeing/how-to-live-well/headspace-app-free-for-students/)\nWellbeing Events (https://www.bu.edu/studentwellbeing/how-to-live-well/attend-an-event/)\nMicrowavable Meals (https://www.bu.edu/studentwellbeing/how-to-live-well/microwave-magic/)\nHomesickness (https://www.bu.edu/studentwellbeing/files/2024/09/Guide-Coping-w-Homesickness.pdf)\nDealing with Failure (https://www.bu.edu/studentwellbeing/files/2024/09/guides-Succeeding-at-Failure1.png)\nGraduation Season Care (https://www.bu.edu/studentwellbeing/files/2024/09/guides-taking-care-of-your-wellbeing-during-graduation-season-3.pdf)\nStudy areas:\nMugar Memorial Library (https://www.bu.edu/library/mugar-memorial/about/hours/)\nBU Faculty of CDS\nEducational Resource Center\nPickering Library\nScience & Engineering Library\nBU Study Rooms (https://www.bu.edu/library/about/study-spaces/)\nPlaces to relax:\nBU Beach, GSU, COM Lawn, Amory Park, Pavement Coffeehouse, Charles River Esplanade, Buick Street Market and Cafe (https://www.bu.edu/articles/2024/best-summer-study-spots-on-bu-campus/)\nOutside of school (https://www.bu.edu/articles/2024/boston-university-bucket-list-15-places-you-need-to-visit-while-living-in-boston/)\nFood around BU (https://www.tripadvisor.com/RestaurantsNear-g60745-d5789344-Boston_University-Boston_Massachusetts.html)\nEducation plan (https://www.bu.edu/advising/)\nStudy Abroad (https://www.bu.edu/abroad/)\nRate Professors (https://www.ratemyprofessors.com/)\nClubs (https://bu.campuslabs.com/engage/organizations)\nFood (https://www.bu.edu/dining/where-to-eat/)\nAcademic Support:\n(https://www.bu.edu/advising/educational-resource-center/academic-support/)\nAcademic Coaching\nWorkshops (https://www.bu.edu/advising/calendar/?topic=8418)\nEnglish Groups (https://www.bu.edu/advising/educational-resource-center/english-conversation-groups/)\nGraduate Writing Support (https://www.bu.edu/advising/educational-resource-center/graduate-writing-support/)\nPeer Tutoring (https://www.bu.edu/advising/educational-resource-center/peer-tutoring/)\nFood bank lists (https://www.gbfb.org/need-food/#googtrans(en|en)), (https://www.boston.gov/departments/food-justice/find-your-food-pantry)\nLife perspective:\nFree/discount (https://www.bu.edu/articles/2007/cheap-thrills-when-it-pays-to-be-a-student/)\nFreedom Trail (https://www.thefreedomtrail.org/)\nRevere Beach (https://reverebeach.com/)\nMuseum of Fine Arts (https://mfa.org/)\nDiscounts:\nNYC $15 (http://www.fungwahbus.com/)\nIsabella Gardner $5 (https://www.gardnermuseum.org/)\nBoston Ballet $15 (https://www.bostonballet.org/)\nPaul Revere’s House $2.50 (https://www.paulreverehouse.org/)\nHarvard Museum $7 (https://www.hmnh.harvard.edu/)\nBroadway Tickets (https://www.meetboston.com/?seqnum=12714&type=event)\nIce-skating (https://www.boston-hotels-ma.com/en/bostoncommonfrogpond.html)\nHarbor Cruises (https://www.cityexperiences.com/boston/city-cruises/?pageNo=1&query=&sortBy=prodv3_ce_experiences_weightScaled_desc&specialCouponCategories=&city=Boston&city=Salem&country=&webCategoriesMain=&durationTiming=&brandTag=&dateMin=&dateMax=&hierarchical.lvl0=&showPriceWithFees=false)\nSports Clubs (https://www.bu.edu/fitrec/what-we-offer/clubsims/club-sports/)\nBU FitRec (https://www.bu.edu/fitrec/)\nBU Sports Events (https://goterriers.com/calendar)\nBowling/Billiards (https://bu.edu/gsu/things-to-do/the-games-room/) \n",
].join("\n");

export async function POST(request: NextRequest) {
	const reqBody = await request.json();

	console.log(reqBody);

	const pplxReqBody = {
		model: "llama-3.1-sonar-huge-128k-online",
		messages: [
			{
				role: "system",
				content: prompt,
			},
			...reqBody,
		],
		max_tokens: 500,
	};

	// console.log(process.env.PPLX_KEY);
	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.PPLX_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(pplxReqBody),
	};

	try {
		const response = await fetch(
			"https://api.perplexity.ai/chat/completions",
			options
		);
		const result = await response.json();
		// console.log(result);

		const message = result.choices[0].message.content;
		// console.log(message);
		return Response.json({ message });
	} catch (err) {
		console.error(err);
		return Response.json({ error: "Error from Perplexity API" });
	}
}
