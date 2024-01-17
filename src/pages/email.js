export const POST = async ({ request }) => {
	if (request.method === 'POST') {
		const data = await request.formData();
		console.log(data);
		const firstname = data.get('firstname');
		const lastname = data.get('lastname');
		const email = data.get('email');
		const message = data.get('message');
		
		if (!firstname || !lastname || !email || !message) {
			return new Response(
				JSON.stringify({
					message: "Missing required fields",
				}),
				{ status: 400 }
			);
		}

		const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

		if (!RESEND_API_KEY) {
			return new Response(
				JSON.stringify({
					message: "Missing Resend API Key",
				}),
				{ status: 500 }
			);
		}
		
		const msg = {
			from: 'onboarding@resend.dev',
			to: ['e.benjaminsalazarrubilar@gmail.com'],
			subject: 'Mensaje desde el sitio web',
			html: `<p>Nombre: ${firstname} ${lastname}</p><p>Email: ${email}</p><p>Mensaje: ${message}</p>`,
		};

		const res = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${RESEND_API_KEY}`,
				},
				body: JSON.stringify(msg),
		}).catch((err) => {
			return new Response(
				JSON.stringify({
					message: "Error sending email",
				}),
				{ status: 500 }
			);
		}
		);

		if (res.ok) {
			return new Response(
				JSON.stringify({
					message: "Email sent successfully",
				}),
				{ status: 200 }
			);
		}
	} else {
		return new Response(
			JSON.stringify({
				message: "Method not allowed",
			}),
			{ status: 405 }
		);
	}
}