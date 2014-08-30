<?php
$base_url = (@$_SERVER['HTTPS'] ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] .'/';
$download_folder = 'dl/';

if(isset($_GET['f']) && isset($_GET['t'])){
	$file = $download_folder.$_GET['f'].'.pdf';
	$title = $_GET['t'].'.pdf';
	header('Content-Description: File Transfer');
	header('Content-Type: application/octet-stream');
	header("Content-Disposition: inline; filename=$title");
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate');
	header('Pragma: public');
	header('Content-Length: ' . filesize($file));
	ob_clean();
	flush();
	readfile($file);	
	exit;
}
//prepare data
$data = json_decode(file_get_contents('php://input'));

function currency($v){
	return '$'.number_format(floatval($v),2);
}

date_default_timezone_set("UTC"); 
$timezoneOffset = $data->timezoneOffset;
$invoiceNo = $data->invoiceNo;
$title = "Invoice ".$invoiceNo;

require_once('tcpdf/config/tcpdf_config.php');
require_once('tcpdf/tcpdf.php');


$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, 'A4', true, 'UTF-8', false);

// set document information
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor('TimeLineSync');
$pdf->SetTitle($title);

$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
$pdf->SetMargins(5, 24, 7);
$pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);
$pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);
$pdf->SetLineWidth(0.1);

// add a page
$pdf->AddPage();

$pdf->SetFont('helvetica', 'B', 10);
$pdf->setFontSpacing(5);
$pdf->setColor('text',177,173,173);
$pdf->Cell(0, 15, 'INVOICE', 0, false, 'C', 0, '', 0, false, 'M', 'M');


$pdf->SetFont('times', '', 10);
$pdf->setFontSpacing(0);
$pdf->setColor('text',0,0,0);

$pdf->Ln(10);

$pdf->Write(1,$data->company,false,false,'',true);
$pdf->WriteHTML('<p>'.nl2br($data->address).'</p>',true,false,true);
if(trim($data->phone))
	$pdf->Write(1,'Phone: '.$data->phone,false,false,'',true);
$pdf->Ln(20);

$y1 = $pdf->GetY();
$pdf->SetFont('times', 'B', 14);
$pdf->Write(1,"Client: ".$data->items[0]->case->client,false,false,'',true);
$pdf->Write(1,"Subject: ".$data->items[0]->case->full_name,false,false,'',true);
$y2 = $pdf->GetY();


$b  = "border:1px solid #000;";
$bl = "border-left:1px solid #000;";
$br = "border-right:1px solid #000;";
$bt = "border-top:1px solid #000;";
$bb = "border-bottom:1px solid #000;";

$str = '';
$total = 0;
foreach ($data->items as $item) {
	$total = $total + floatval(@$item->unitCost*@$item->quantity);
	$str .= '<tr>';
	$str .= '<td style="'.$bl.'">'.@$item->case->case_no.'</td>';
	$str .= '<td>'.@$item->description.'</td>';
	$str .= '<td>'.currency(@$item->unitCost).'</td>';
	$str .= '<td>'.@$item->quantity.'</td>';
	$str .= '<td style="'.$br.'">'.currency(@$item->unitCost*@$item->quantity).'</td>';
	$str .= '</tr>';
	//$str .= '<tr><td colspan="5" style="'.$bl.$br.'"></td></tr>';
}

$due = currency($total - $data->paid);
$total = currency($total);
$paid = currency($data->paid);


$table = <<<HTML
<table cellspacing="0" cellpadding="6" border="1">
  <tr>
    <td style="width:100px">Invoice #</td>
    <td style="width:177px;text-align:right"> {$data->invoiceNo} </td>    
  </tr>
  <tr>
  	<td>Date</td>
  	<td  style="width:177px;text-align:right">{$data->date}</td>
  </tr>
  <tr>
    <td>Amount Due</td>
  	<td style="width:177px;text-align:right">{$due}</td>
  </tr>
</table>
HTML;

$pdf->SetFont('times', '', 10);
//$pdf->SetY($y1);
$pdf->SetX(125);
$pdf->WriteHTML($table,true,false,true);
//$pdf->SetY($y2);
//$pdf->SetX(0);
$pdf->Ln(1);


$table = <<<HTML
<table cellpadding="10" cellspacing="0" border="0">
	<tr>
		<th style="{$b}text-align:center;width:168px">Item</th>
		<th style="{$b}text-align:center;width:271px">Description</th>
		<th style="{$b}text-align:center;width:85px">Unit Cost</th>
		<th style="{$b}text-align:center;width:85px">Quantity</th>
		<th style="{$b}text-align:center;width:95px">Price</th>
	</tr>
	{$str}

	<tr>
		<td colspan="2" style="{$bl}"></td>
		<td colspan="2" style="{$bl}{$bt}{$bb}text-align:right">Subtotal</td>
		<td style="{$br}{$bt}{$bb}">{$total}</td>
	</tr>
	<tr>
		<td colspan="2" style="{$bl}text-align"></td>
		<td colspan="2" style="{$bl}{$bt}{$bb}text-align:right;">Total</td>
		<td style="{$br}{$bt}{$bb}">{$total}</td>
	</tr>
	<tr>
		<td colspan="2" style="{$bl}text-align"></td>
		<td colspan="2" style="{$bl}{$bt}{$bb}text-align:right;">Amount Paid</td>
		<td style="{$br}{$bt}{$bb}">{$paid}</td>
	</tr>
	<tr>
		<td colspan="2" style="{$bl}{$bb}text-align"></td>
		<td colspan="2" style="{$bl}{$bt}{$bb}text-align:right;">Balance Due</td>
		<td style="{$br}{$bt}{$bb}">{$due}</td>
	</tr>
</table>
HTML;
$pdf->WriteHTML($table,true);

$pdf->SetFont('helvetica', '', 9);
$pdf->setFontSpacing(2);
$pdf->Cell(0, 9, 'TERMS', 'B', true, 'C', 0, '', 0, false, 'M', 'M');
$pdf->setFontSpacing(0);
$pdf->SetFont('times', '', 9);
$pdf->Ln(3);
$pdf->Cell(0, 9, $data->terms, false, false, 'C', 0, '', 0, false, 'M', 'M');

$file = md5($invoiceNo);
$pdf->Output($download_folder.$file.'.pdf', 'F');
echo json_encode(array('success'=>true,'file'=>$file,'title'=> $title,'url'=> $base_url . 'download_invoice.php?f='.urlencode($file).'&t='.urlencode($title) ));
//echo json_encode($data);
