export const POST = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      console.error('❌ Method not allowed:', request.method);
      return new Response(
        JSON.stringify({
          message: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await request.formData();
    const firstname = data.get('firstname');
    const lastname = data.get('lastname');
    const email = data.get('email');
    const message = data.get('message');
    const turnstileResponse = data.get('cf-turnstile-response');

    if (!firstname || !lastname || !email || !message) {
      const missingFields = [];
      if (!firstname) missingFields.push('firstname');
      if (!lastname) missingFields.push('lastname');
      if (!email) missingFields.push('email');
      if (!message) missingFields.push('message');

      console.error('❌ Missing required fields:', {
        missingFields,
        receivedFields: {
          firstname: !!firstname,
          lastname: !!lastname,
          email: !!email,
          message: !!message,
        },
      });

      return new Response(
        JSON.stringify({
          message: 'Missing required fields',
          missing: missingFields,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!turnstileResponse) {
      console.error('❌ Missing Turnstile response');
      return new Response(
        JSON.stringify({
          message: 'CAPTCHA verification failed',
          error: 'Missing Turnstile response',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verify Turnstile token
    let turnstileVerified = false;
    try {
      // Verify the token with Cloudflare
      const TURNSTILE_SECRET_KEY = import.meta.env.TURNSTILE_SECRET_KEY;

      if (!TURNSTILE_SECRET_KEY) {
        console.error('❌ Missing Turnstile Secret Key');
        return new Response(
          JSON.stringify({
            message: 'Server configuration error',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const formData = new FormData();
      formData.append('secret', TURNSTILE_SECRET_KEY);
      formData.append('response', turnstileResponse);
      formData.append('remoteip', request.headers.get('x-forwarded-for') || '');

      const turnstileVerify = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          body: formData,
        }
      );

      const turnstileResult = await turnstileVerify.json();
      turnstileVerified = turnstileResult.success;

      if (!turnstileVerified) {
        console.error('❌ Turnstile verification failed:', turnstileResult);
        return new Response(
          JSON.stringify({
            message: 'CAPTCHA verification failed',
            error: turnstileResult['error-codes'] || 'Unknown error',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } catch (error) {
      console.error('❌ Error during Turnstile verification:', error);
      return new Response(
        JSON.stringify({
          message: 'Error during CAPTCHA verification',
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('❌ Missing Resend API Key');
      return new Response(
        JSON.stringify({
          message: 'Missing Resend API Key',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const msg = {
      from: 'onboarding@resend.dev',
      to: ['e.benjaminsalazarrubilar@gmail.com'],
      subject: 'Message from website',
      html: `<p>Name: ${firstname} ${lastname}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(msg),
    });

    const data_res = await res.json();

    if (res.ok) {
      return new Response(
        JSON.stringify({
          message: 'Email sent successfully',
          id: data_res?.id,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      console.error('❌ Error from Resend API:', {
        status: res.status,
        statusText: res.statusText,
        error: data_res?.error || 'Unknown error',
        errorCode: data_res?.statusCode,
        message: data_res?.message,
        name: data_res?.name,
      });

      return new Response(
        JSON.stringify({
          message: 'Error sending email',
          error: data_res?.error || 'Unknown error',
          status: res.status,
          errorDetails: {
            code: data_res?.statusCode,
            message: data_res?.message,
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    // Detailed error logging
    console.error('❌ Server error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: typeof error,
      isAxiosError: error.isAxiosError || false,
      code: error.code,
      timestamp: new Date().toISOString(),
    });

    // Try to extract more information if possible
    let additionalInfo = {};
    try {
      if (error.response) {
        additionalInfo.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        };
      }
      if (error.request) {
        additionalInfo.request = {
          method: error.request.method,
          path: error.request.path,
          host: error.request.host,
        };
      }
      if (Object.keys(additionalInfo).length > 0) {
        console.error('📊 Additional error context:', additionalInfo);
      }
    } catch (innerError) {
      console.error('❌ Error while extracting additional error info:', innerError.message);
    }

    return new Response(
      JSON.stringify({
        message: 'Server error',
        error: error.message,
        name: error.name,
        code: error.code || 'UNKNOWN_ERROR',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
