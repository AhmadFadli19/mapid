<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OTPMail extends Mailable
{
    use Queueable, SerializesModels;

    // ✅ TAMBAHKAN PROPERTY INI
    public $code;
    public $type;

    // ✅ UBAH CONSTRUCTOR
    public function __construct($code, $type = 'verification')
    {
        $this->code = $code;
        $this->type = $type;
    }

    public function envelope(): Envelope
    {
        $subject = $this->type === 'verification'
            ? 'Kode Verifikasi Email'
            : 'Kode Reset Password';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
